# code(read local file send to gemma):
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
        capture_output=True,
        text=True,
    )

    return result.stdout.strip()


# Example usage
answer = ask_gemma_with_file("example.txt", "Summarize this document briefly.")
print(answer)
