# Local AI Assistant

A secure, privacy-focused AI chatbot application that runs entirely on
your local machine using Gamma 3 via Ollama. Your conversations and data
never leave your device.

## 🌟 Features

-   **Local AI Processing**: Powered by Gamma 3 running through Ollama -
    no internet connection required after setup
-   **Complete Privacy**: All data stays on your local machine - no
    cloud services, no data sharing
-   **File Context Management**: Upload and manage files to provide
    context for the AI assistant
-   **Secure Storage**: All conversations and uploaded files are stored
    locally on your device
-   **Modern UI**: Clean, intuitive interface with real-time chat
    experience
-   **Cross-Platform**: Works on Windows, macOS, and Linux

## 🚀 Quick Start

### Prerequisites

1.  **Install Ollama**

    ``` bash
    # Visit https://ollama.ai and download the application for your OS
    # Or use the install script for Linux:
    curl -fsSL https://ollama.ai/install.sh | sh
    ```

### Pull Gamma 3 Model

``` bash
ollama pull gamma3
# or use the specific model name if different
# ollama pull your-gamma3-model
```

### Installation

#### Clone or Download this Application

``` bash
git clone <repository-url>
cd local-ai-assistant
```

#### Install Dependencies

``` bash
npm install
```

#### Start the Application

``` bash
npm start
```

Open your browser and navigate to http://localhost:3000

## 🔧 Configuration

### Ollama Setup

Ensure Ollama is running with Gamma 3 model:

``` bash
# Check if Ollama is running
ollama list

# If Gamma 3 isn't listed, pull it
ollama pull gamma3

# Start Ollama service (usually runs automatically)
ollama serve
```

### Environment Variables (Optional)

Create a `.env` file in the root directory:

    REACT_APP_OLLAMA_BASE_URL=http://localhost:11434
    REACT_APP_MODEL_NAME=gamma3
    REACT_APP_MAX_TOKENS=2048

## 💡 How to Use

### Starting a Conversation

-   Launch the application
-   Type your message in the input field at the bottom
-   Press Enter or click the send button
-   Wait for the response --- Gamma 3 will process your query locally

### Using File Context

-   **Upload Files**: Click "Choose Files" in the left sidebar or drag
    and drop files
-   **Supported Formats**: Text files, PDFs, Word documents, images
    (depending on Gamma 3's capabilities)
-   **Manage Files**: View all uploaded files in the sidebar, remove
    files as needed
-   **Context Awareness**: The AI will use uploaded files as context for
    your conversations

### Privacy Features

✅ No data sent to external servers\
✅ All files stored locally\
✅ Conversation history stays on your device\
✅ No telemetry or analytics\
✅ Optional local encryption

## 🛡️ Security & Privacy

### Data Storage

All application data is stored locally in your browser's storage:

-   Conversations: Stored in browser's local storage
-   Uploaded Files: Processed and stored locally
-   Settings: Saved in browser's local storage

### No Internet Required

Once installed and configured, this application works completely
offline:

-   AI model runs locally via Ollama
-   No API calls to external services
-   No data leakage or privacy concerns

## 🔄 API Integration

The application connects to Ollama's local API:

``` javascript
const response = await fetch('http://localhost:11434/api/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gamma3',
    prompt: userMessage,
    stream: false,
    options: {
      temperature: 0.7,
      top_p: 0.9,
    }
  })
});
```

## 🗂️ Project Structure

    local-ai-assistant/
    ├── public/
    │   ├── index.html
    │   └── manifest.json
    ├── src/
    │   ├── components/
    │   │   ├── AIAssistant.js
    │   │   └── AIAssistant.css
    │   ├── services/
    │   │   └── ollamaService.js
    │   ├── utils/
    │   │   └── fileHandler.js
    │   ├── App.js
    │   └── index.js
    ├── package.json
    └── README.md

## 🐛 Troubleshooting

### Common Issues

#### Ollama Connection Failed

    Error: Cannot connect to Ollama service

Solution: Ensure Ollama is running: `ollama serve`

#### Model Not Found

    Error: Model gamma3 not found

Solution: Pull the model: `ollama pull gamma3`

#### CORS Errors

Solution: Start Ollama with:

``` bash
OLLAMA_ORIGINS="*" ollama serve
```

#### File Upload Issues

Solution: Check browser permissions and file size limits

## 📊 System Requirements

### Minimum

-   8GB RAM
-   4GB free storage
-   Modern browser (Chrome 90+, Firefox 88+, Safari 14+)

### Recommended

-   16GB+ RAM
-   8GB+ storage
-   Multi-core CPU
