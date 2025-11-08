import requests

response = requests.post("http://localhost:11434/api/generate", json={
    "model": "gemma:3",
    "prompt": "Explain neural networks simply."
})

print(response.json()["response"])
