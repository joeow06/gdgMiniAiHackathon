const API_BASE = 'http://localhost:8000/api';

export const apiService = {
  // Upload document to ChromaDB
  async uploadDocument(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE}/upload-document`, {
      method: 'POST',
      body: formData,
    });
    
    return response.json();
  },

  // Send chat message with context
  async sendChat(message, useContext = true) {
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        use_context: useContext
      }),
    });
    
    return response.json();
  },

  // Get all documents from ChromaDB
  async getDocuments() {
    const response = await fetch(`${API_BASE}/documents`);
    return response.json();
  }
};