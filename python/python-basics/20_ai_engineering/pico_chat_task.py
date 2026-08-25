# Multi-turn Pico chat with conversation history stored per PR ID
from fastapi import FastAPI
from pydantic import BaseModel
from groq import Groq
import os

app = FastAPI()
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

conversation_store = {}   # pr_id → message history

class Message(BaseModel):
    pr_id: str
    user_message: str

@app.post("/pico/chat")
async def pico_chat(msg: Message):
    if msg.pr_id not in conversation_store:
        conversation_store[msg.pr_id] = []

    conversation_store[msg.pr_id].append({"role": "user", "content": msg.user_message})

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=conversation_store[msg.pr_id]
    )

    reply = response.choices[0].message.content
    conversation_store[msg.pr_id].append({"role": "assistant", "content": reply})

    return {"pr_id": msg.pr_id, "reply": reply}
