import requests
import streamlit as st

st.title("💬 Gemma 3 Local Chatbot")

# Fetch available models (if supported)
def get_available_models():
    url = "http://localhost:11434/api/models"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            models = response.json()
            return [model['name'] for model in models]
        else:
            st.error(f"Failed to get models: {response.status_code}")
            return []
    except requests.exceptions.RequestException as e:
        st.error(f"Error: {e}")
        return []

# Get available models once when the app loads
models = get_available_models()

# If models are available, allow the user to select one
if models:
    selected_model = st.selectbox("Select model:", models)
else:
    selected_model = st.text_input("Model not found. Please specify a model:", "gemma:3:270m")  # Fallback model

# Input prompt for the chatbot
prompt = st.text_area("Enter your prompt:")

# Button to generate response
if st.button("Generate"):
    with st.spinner("Generating response..."):
        try:
            # Send a POST request to generate the response based on the model and prompt
            response = requests.post("http://localhost:11434/api/generate", json={
                "model": "gemma3:270m",
                "prompt": prompt
            })
            if response.status_code == 200:
                st.write(response.json())
            else:
                st.error(f"Generation failed: {response.status_code} - {response.text}")
        except requests.exceptions.RequestException as e:
            st.error(f"Error with the request: {e}")
