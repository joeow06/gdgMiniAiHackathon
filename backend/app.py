import streamlit as st
import os
import shutil
from chroma_manager import ChromaManager
from llm_handler import LocalLLM
import json
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import asyncio
from threading import Thread

# Initialize components
@st.cache_resource
def init_chroma():
    return ChromaManager()

@st.cache_resource
def init_llm():
    return LocalLLM()

# FastAPI app for React frontend
app = FastAPI(title="Local AI Assistant API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global instances
chroma_manager = init_chroma()
llm_handler = init_llm()

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """Handle file uploads from React frontend"""
    try:
        # Create shared_files directory if it doesn't exist
        os.makedirs("shared_files", exist_ok=True)
        
        # Save uploaded file
        file_path = f"shared_files/{file.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Add to ChromaDB
        chunk_count = chroma_manager.add_documents(file_path, file.filename)
        
        return {
            "status": "success",
            "filename": file.filename,
            "chunks_added": chunk_count,
            "message": f"File '{file.filename}' processed successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat")
async def chat_endpoint(data: dict):
    """Handle chat messages from React frontend"""
    try:
        prompt = data.get("prompt", "")
        uploaded_files = data.get("uploadedFiles", [])
        
        if not prompt:
            raise HTTPException(status_code=400, detail="Prompt is required")
        
        # Search for relevant context
        search_results = chroma_manager.search_similar(prompt, n_results=3)
        context = ""
        
        if search_results and 'documents' in search_results:
            context = " ".join([doc for sublist in search_results['documents'] for doc in sublist])
        
        # Generate response using local LLM
        response = llm_handler.generate_response(prompt, context)
        
        return {
            "status": "success",
            "response": response,
            "context_used": bool(context)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "chroma_count": chroma_manager.get_collection_stats()}

def run_fastapi():
    """Run FastAPI server"""
    uvicorn.run(app, host="0.0.0.0", port=8000)

# Streamlit interface
def main():
    st.set_page_config(page_title="Local AI Assistant", layout="wide")
    
    st.title("🔒 Local AI Assistant - Privacy First")
    st.markdown("""
    This AI assistant runs completely locally on your machine. 
    No data is sent to external servers - ensuring complete privacy and security.
    """)
    
    # Initialize session state
    if "messages" not in st.session_state:
        st.session_state.messages = []
    
    # Sidebar for file upload
    with st.sidebar:
        st.header("📁 File Management")
        
        uploaded_file = st.file_uploader(
            "Upload files for context",
            type=['txt', 'pdf', 'docx', 'md'],
            help="Files are processed locally and stored in ChromaDB"
        )
        
        if uploaded_file:
            # Save file
            file_path = f"shared_files/{uploaded_file.name}"
            with open(file_path, "wb") as f:
                f.write(uploaded_file.getbuffer())
            
            # Add to ChromaDB
            chunk_count = chroma_manager.add_documents(file_path, uploaded_file.name)
            
            st.success(f"✅ {uploaded_file.name} processed! Added {chunk_count} chunks to knowledge base.")
        
        st.markdown("---")
        st.metric("Documents in DB", chroma_manager.get_collection_stats())
    
    # Main chat area
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])
    
    # Chat input
    if prompt := st.chat_input("Ask me anything..."):
        # Add user message
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)
        
        # Generate AI response
        with st.chat_message("assistant"):
            with st.spinner("Thinking locally..."):
                # Search for relevant context
                search_results = chroma_manager.search_similar(prompt, n_results=3)
                context = ""
                
                if search_results and 'documents' in search_results:
                    context = " ".join([doc for sublist in search_results['documents'] for doc in sublist])
                
                # Generate response
                response = llm_handler.generate_response(prompt, context)
                
                st.markdown(response)
        
        # Add AI response to history
        st.session_state.messages.append({"role": "assistant", "content": response})

if __name__ == "__main__":
    # Create necessary directories
    os.makedirs("shared_files", exist_ok=True)
    os.makedirs("chroma_db", exist_ok=True)
    
    # Run both Streamlit and FastAPI
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "api":
        run_fastapi()
    else:
        main()