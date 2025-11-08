import requests
import streamlit as st

st.title("💬 Gemma 3 Local Chatbot")

# Input prompt
prompt = st.text_area("Enter your prompt:")

# Button to generate response
if st.button("Generate"):
    with st.spinner("Generating response..."):
        response = requests.post("http://localhost:11434/api/generate", json={
            "model": "gemma:3",
            "prompt": prompt
        })
        st.write(response.json()["response"])
