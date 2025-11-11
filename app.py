import json

import requests
import streamlit as st

st.title("💬 Gemma 3 Local Chatbot")

# Input prompt for the chatbot
prompt = st.text_area("Enter your prompt:")

# For Stream Effect
chat_placeholder = st.empty()

# Button to generate response
if st.button("Generate"):
    with st.spinner("Generating response..."):
        try:
            # Send a POST request to generate the response based on the model and prompt
            response = requests.post(
                "http://localhost:11434/api/generate",
                json={"model": "gemma3:1b", "prompt": prompt},
            )

            #  Successful Response -> Get the Stream, Compile as One Text
            if response.status_code == 200:
                full_output = ""
                for line in response.iter_lines():
                    if not line:
                        continue
                    obj = json.loads(line)  # parse each line individually
                    if "response" in obj:
                        full_output += obj["response"]

                        chat_placeholder.text(
                            full_output
                        )  # Writes the response in the same row

            else:
                st.error(f"Generation failed: {response.status_code} - {response.text}")

        except requests.exceptions.RequestException as e:
            st.error(f"Error with the request: {e}")
