#commmand prompt
ollama run gemma:3 "hello"



#code(read local file send to gemma):
import subprocess

def ask_gemma_with_file(filepath, question):
    # Read the file (make sure it's small enough to fit in model context)
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Combine the document with your question
    prompt = f"Here is a document:\n{content}\n\nNow answer this question:\n{question}"

    # Full path to Ollama (Windows)
    result = subprocess.run(
        ["C:\\Program Files\\Ollama\\ollama.exe", "run", "gemma:3", prompt],
        capture_output=True, text=True
    )

    return result.stdout.strip()


# Example usage
answer = ask_gemma_with_file("example.txt", "Summarize this document briefly.")
print(answer)

run the script(command promt)
python read_local_file.py



#use streamlit UI
import streamlit as st, subprocess

st.title("Offline File Reader (Ollama + Gemma 3)")

uploaded = st.file_uploader("Upload a text file")

if uploaded:
    text = uploaded.read().decode("utf-8")
    question = st.text_input("Ask something about it")

    if st.button("Ask"):
        result = subprocess.run(
            ["C:\\Program Files\\Ollama\\ollama.exe", "run", "gemma:3",
             f"File content:\n{text}\n\nQuestion: {question}"],
            capture_output=True, text=True
        )
        st.write(result.stdout)



#run
streamlit run <filename>.py
