import { useState, useRef } from 'react';
import './styles.css';

const AIAssistant = () => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Handle file upload
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      type: file.type,
      size: file.size,
      file: file
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove uploaded file
  const handleRemoveFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  // Handle prompt submission
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

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        id: Date.now() + 1,
        text: "This is a simulated AI response. In a real application, this would connect to your AI backend service.",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="ai-assistant">
      <div className="assistant-container">
        {/* Left Sidebar - File Upload */}
        <div className="sidebar">
          <div className="upload-section">
            <h3>Context & Memory</h3>
            <p className="upload-description">
              Upload files to provide context for the AI assistant
            </p>
            
            <div className="upload-area">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                multiple
                className="file-input"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="upload-button">
                <span className="upload-icon">📁</span>
                Choose Files
              </label>
              <p className="upload-hint">or drag and drop files here</p>
            </div>

            {/* Uploaded Files List */}
            <div className="uploaded-files">
              <h4>Uploaded Files ({uploadedFiles.length})</h4>
              {uploadedFiles.length === 0 ? (
                <p className="no-files">No files uploaded yet</p>
              ) : (
                <div className="files-list">
                  {uploadedFiles.map(file => (
                    <div key={file.id} className="file-item">
                      <div className="file-info">
                        <span className="file-icon">📄</span>
                        <div className="file-details">
                          <span className="file-name">{file.name}</span>
                          <span className="file-size">{formatFileSize(file.size)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveFile(file.id)}
                        className="remove-file"
                        title="Remove file"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="main-content">
          <div className="chat-container">
            {/* Messages Display */}
            <div className="messages-area">
              {messages.length === 0 ? (
                <div className="welcome-message">
                  <h2>AI Assistant</h2>
                  <p>Start a conversation or upload files for context</p>
                </div>
              ) : (
                messages.map(message => (
                  <div
                    key={message.id}
                    className={`message ${message.sender}`}
                  >
                    <div className="message-content">
                      <div className="message-text">{message.text}</div>
                      <div className="message-timestamp">
                        {message.timestamp}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="message ai loading">
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
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
                  placeholder="Ask me anything..."
                  className="prompt-input"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className="send-button"
                  disabled={!prompt.trim() || isLoading}
                >
                  {isLoading ? '⏳' : '➤'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;