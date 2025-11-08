import { useState, useRef } from 'react';
import './AIAssistant.css';

// API base URL for the local backend
const API_BASE_URL = 'http://localhost:8000/api';

const AIAssistant = () => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Handle file upload with backend integration
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/upload`, {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        
        if (result.status === 'success') {
          const newFile = {
            id: Date.now() + Math.random(),
            name: file.name,
            type: file.type,
            size: file.size,
            file: file,
            chunks: result.chunks_added
          };
          
          setUploadedFiles(prev => [...prev, newFile]);
          
          // Add success message
          const successMessage = {
            id: Date.now(),
            text: `✅ File "${file.name}" uploaded successfully! Added ${result.chunks_added} chunks to local knowledge base.`,
            sender: 'system',
            timestamp: new Date().toLocaleTimeString()
          };
          setMessages(prev => [...prev, successMessage]);
        } else {
          throw new Error(result.detail || 'Upload failed');
        }
      } catch (error) {
        console.error('Upload error:', error);
        const errorMessage = {
          id: Date.now(),
          text: `❌ Error uploading "${file.name}". Please check if the backend server is running. Error: ${error.message}`,
          sender: 'system',
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove uploaded file
  const handleRemoveFile = async (fileId) => {
    const fileToRemove = uploadedFiles.find(file => file.id === fileId);
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    
    // Add removal message
    const removalMessage = {
      id: Date.now(),
      text: `🗑️ Removed "${fileToRemove?.name}" from local list (note: file chunks remain in database)`,
      sender: 'system',
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, removalMessage]);
  };

  // Handle prompt submission with backend integration
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const userMessage = { 
      id: Date.now(), 
      text: prompt, 
      sender: 'user', 
      timestamp: new Date().toLocaleTimeString() 
    };

    setMessages(prev => [...prev, userMessage]);
    setPrompt('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          uploadedFiles: uploadedFiles.map(f => f.name)
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const aiMessage = {
        id: Date.now() + 1,
        text: data.response,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString(),
        contextUsed: data.context_used
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "❌ Error connecting to local AI server. Please make sure the Python backend is running on port 8000. Start it with: `cd backend && python app.py`",
        sender: 'system',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Clear all messages
  const handleClearChat = () => {
    setMessages([]);
  };

  // Check backend health
  const checkBackendHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      return data;
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  };

  // Test backend connection on component mount
  useState(() => {
    checkBackendHealth().then(health => {
      if (health.status === 'healthy') {
        const healthMessage = {
          id: Date.now(),
          text: `🔗 Connected to local AI backend. ChromaDB has ${health.chroma_count} documents.`,
          sender: 'system',
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prev => [healthMessage]);
      } else {
        const errorMessage = {
          id: Date.now(),
          text: "⚠️ Backend server not connected. Please start the Python backend with: `cd backend && python app.py`",
          sender: 'system',
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prev => [errorMessage]);
      }
    });
  }, []);

  return (
    <div className="ai-assistant">
      <div className="assistant-container">
        {/* Left Sidebar - File Upload */}
        <div className="sidebar">
          <div className="upload-section">
            <div className="sidebar-header">
              <h3>🔒 Local AI Assistant</h3>
              <p className="privacy-badge">100% Private • No Data Leaves Your Machine</p>
            </div>
            
            <div className="upload-area">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                multiple
                className="file-input"
                id="file-upload"
                accept=".txt,.pdf,.docx,.md,.json,.csv"
                disabled={isLoading}
              />
              <label htmlFor="file-upload" className="upload-button">
                <span className="upload-icon">📁</span>
                {isLoading ? 'Processing...' : 'Choose Files'}
              </label>
              <p className="upload-hint">Supports: TXT, PDF, DOCX, MD, JSON, CSV</p>
              <p className="security-note">🔐 Files stay locally on your machine</p>
            </div>

            {/* Uploaded Files List */}
            <div className="uploaded-files">
              <div className="files-header">
                <h4>Uploaded Files ({uploadedFiles.length})</h4>
                {uploadedFiles.length > 0 && (
                  <button 
                    onClick={() => setUploadedFiles([])} 
                    className="clear-files-btn"
                    title="Clear all files from list"
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              {uploadedFiles.length === 0 ? (
                <div className="no-files">
                  <p>No files uploaded yet</p>
                  <small>Upload files to provide context for the AI</small>
                </div>
              ) : (
                <div className="files-list">
                  {uploadedFiles.map(file => (
                    <div key={file.id} className="file-item">
                      <div className="file-info">
                        <span className="file-icon">
                          {file.type.includes('pdf') ? '📕' : 
                           file.type.includes('word') ? '📄' : 
                           file.type.includes('json') ? '⚙️' : 
                           file.type.includes('csv') ? '📊' : '📄'}
                        </span>
                        <div className="file-details">
                          <span className="file-name" title={file.name}>
                            {file.name.length > 20 ? file.name.substring(0, 20) + '...' : file.name}
                          </span>
                          <span className="file-meta">
                            {formatFileSize(file.size)}
                            {file.chunks && <span className="chunk-count"> • {file.chunks} chunks</span>}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveFile(file.id)}
                        className="remove-file"
                        title="Remove file from list"
                        disabled={isLoading}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* System Status */}
            <div className="system-status">
              <h4>System Status</h4>
              <div className="status-item">
                <span className="status-label">Backend:</span>
                <span className="status-indicator online">● Connected</span>
              </div>
              <div className="status-item">
                <span className="status-label">AI Model:</span>
                <span className="status-indicator online">● Local</span>
              </div>
              <div className="status-item">
                <span className="status-label">Database:</span>
                <span className="status-indicator online">● ChromaDB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="main-content">
          <div className="chat-header">
            <div className="chat-title">
              <h2>Private AI Assistant</h2>
              <p>Ask questions about your uploaded documents</p>
            </div>
            <button 
              onClick={handleClearChat}
              className="clear-chat-btn"
              disabled={messages.length === 0 || isLoading}
            >
              🗑️ Clear Chat
            </button>
          </div>

          <div className="chat-container">
            {/* Messages Display */}
            <div className="messages-area">
              {messages.length === 0 ? (
                <div className="welcome-message">
                  <div className="welcome-icon">🤖</div>
                  <h2>Welcome to Your Private AI Assistant</h2>
                  <p>This AI runs completely on your local machine - no data is sent to the cloud.</p>
                  <div className="feature-list">
                    <div className="feature">
                      <span className="feature-icon">🔒</span>
                      <span>100% Private & Secure</span>
                    </div>
                    <div className="feature">
                      <span className="feature-icon">🚀</span>
                      <span>Local LLM Processing</span>
                    </div>
                    <div className="feature">
                      <span className="feature-icon">💾</span>
                      <span>Local Vector Database</span>
                    </div>
                    <div className="feature">
                      <span className="feature-icon">📁</span>
                      <span>Document Context Awareness</span>
                    </div>
                  </div>
                  <div className="getting-started">
                    <h4>Getting Started:</h4>
                    <ol>
                      <li>Upload documents using the sidebar</li>
                      <li>Ask questions about your content</li>
                      <li>The AI will use your documents as context</li>
                      <li>Everything processes locally on your machine</li>
                    </ol>
                  </div>
                </div>
              ) : (
                messages.map(message => (
                  <div
                    key={message.id}
                    className={`message ${message.sender} ${message.contextUsed ? 'with-context' : ''}`}
                  >
                    <div className="message-content">
                      <div className="message-header">
                        <span className="message-sender">
                          {message.sender === 'user' ? '👤 You' : 
                           message.sender === 'ai' ? '🤖 AI' : 
                           '⚙️ System'}
                        </span>
                        {message.contextUsed && (
                          <span className="context-badge" title="Used uploaded documents as context">
                            📚 Using Context
                          </span>
                        )}
                      </div>
                      <div className="message-text">{message.text}</div>
                      <div className="message-footer">
                        <span className="message-timestamp">
                          {message.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="message ai loading">
                  <div className="message-content">
                    <div className="message-header">
                      <span className="message-sender">🤖 AI</span>
                    </div>
                    <div className="typing-indicator">
                      <span>Processing locally</span>
                      <div className="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="input-area">
              <div className="input-container">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask me anything about your documents..."
                  className="prompt-input"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className="send-button"
                  disabled={!prompt.trim() || isLoading}
                  title={!prompt.trim() ? "Enter a message" : "Send message"}
                >
                  {isLoading ? (
                    <div className="send-button-loading">
                      <span>⏳</span>
                    </div>
                  ) : (
                    <div className="send-button-ready">
                      <span>🚀</span>
                    </div>
                  )}
                </button>
              </div>
              <div className="input-hint">
                <span>💡 The AI will automatically search through your uploaded documents for relevant context</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;