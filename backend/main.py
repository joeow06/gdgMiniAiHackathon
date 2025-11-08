from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import chromadb
import ollama
import uuid
from datetime import datetime

app = FastAPI(title="Local AI Assistant API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite/React
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ChromaDB
chroma_client = chromadb.PersistentClient(path="./chroma_db")
documents_collection = chroma_client.get_or_create_collection(name="documents")

@app.post("/api/upload-document")
async def upload_document(file: UploadFile = File(...)):
    try:
        # Read file content
        content = await file.read()
        
        # Simple text extraction (you can enhance this for PDF/DOCX later)
        try:
            text_content = content.decode('utf-8')
        except:
            text_content = f"File: {file.filename} (binary content)"
        
        # Store in ChromaDB
        doc_id = str(uuid.uuid4())
        documents_collection.add(
            documents=[text_content],
            metadatas=[{
                "filename": file.filename,
                "type": file.content_type,
                "size": len(content),
                "uploaded_at": datetime.now().isoformat()
            }],
            ids=[doc_id]
        )
        
        return {
            "message": "File uploaded successfully",
            "doc_id": doc_id,
            "filename": file.filename
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat")
async def chat_with_context(message: str, use_context: bool = True):
    try:
        relevant_docs = []
        
        if use_context:
            # Search for relevant documents
            results = documents_collection.query(
                query_texts=[message],
                n_results=3
            )
            relevant_docs = results['documents'][0] if results['documents'] else []
        
        # Prepare prompt with context
        if relevant_docs:
            context_text = "\n\n".join(relevant_docs)
            prompt = f"Context:\n{context_text}\n\nQuestion: {message}\n\nAnswer:"
        else:
            prompt = message

        # Get response from Ollama
        response = ollama.generate(model='gamma3', prompt=prompt)
        ai_response = response['response']
        
        return {
            "response": ai_response,
            "context": relevant_docs
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/documents")
async def get_documents():
    try:
        results = documents_collection.get()
        return {
            "documents": [
                {
                    "id": id,
                    "metadata": metadata
                } for id, metadata in zip(results['ids'], results['metadatas'])
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/documents/{document_id}")
async def delete_document(document_id: str):
    try:
        documents_collection.delete(ids=[document_id])
        return {"message": "Document deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)