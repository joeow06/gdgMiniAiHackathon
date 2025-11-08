import chromadb
import os
import hashlib
from sentence_transformers import SentenceTransformer
import uuid

class ChromaManager:
    def __init__(self, persist_directory="./chroma_db"):
        self.persist_directory = persist_directory
        self.client = chromadb.PersistentClient(path=persist_directory)
        self.collection = self.client.get_or_create_collection(name="document_chunks")
        self.encoder = SentenceTransformer('all-MiniLM-L6-v2')
        
    def add_documents(self, file_path, file_name, chunk_size=1000, chunk_overlap=200):
        """Add documents to ChromaDB with chunking"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            # Simple text chunking
            chunks = []
            start = 0
            while start < len(content):
                end = start + chunk_size
                if end < len(content):
                    # Try to break at sentence end
                    break_chars = ['.', '!', '?', '\n']
                    for break_char in break_chars:
                        break_pos = content.rfind(break_char, start, end)
                        if break_pos != -1:
                            end = break_pos + 1
                            break
                
                chunk = content[start:end].strip()
                if chunk:
                    chunks.append(chunk)
                
                start = end - chunk_overlap
            
            # Add chunks to ChromaDB
            for i, chunk in enumerate(chunks):
                chunk_id = f"{file_name}_chunk_{i}"
                metadata = {
                    "file_name": file_name,
                    "chunk_index": i,
                    "total_chunks": len(chunks)
                }
                
                self.collection.add(
                    documents=[chunk],
                    metadatas=[metadata],
                    ids=[chunk_id]
                )
            
            return len(chunks)
            
        except Exception as e:
            print(f"Error adding documents: {e}")
            return 0
    
    def search_similar(self, query, n_results=3):
        """Search for similar documents"""
        try:
            results = self.collection.query(
                query_texts=[query],
                n_results=n_results
            )
            
            return results
        except Exception as e:
            print(f"Error searching: {e}")
            return None
    
    def get_collection_stats(self):
        """Get statistics about the collection"""
        return self.collection.count()
