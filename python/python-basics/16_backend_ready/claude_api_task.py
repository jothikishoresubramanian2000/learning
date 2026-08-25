# Calls Groq API with streaming, prints response token by token
import os
from groq import Groq

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

stream = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[
        {"role": "user", "content": "What is a Purchase Request in one sentence?"}
    ],
    stream=True        # ← this enables streaming
)

for chunk in stream:
    print(chunk.choices[0].delta.content or "", end="", flush=True)
