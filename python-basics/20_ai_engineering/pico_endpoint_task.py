# FastAPI POST /pico/ask sends PR to Groq LLM and returns analysis
import os
from fastapi import FastAPI
from pydantic import BaseModel
from groq import Groq

app = FastAPI()
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

class PRCheck(BaseModel):
    pr_id: str
    amount: float
    category: str
    supplier: str

@app.post("/pico/ask")
async def ask_pico(pr: PRCheck):
    prompt = f"""You are Pico, ProcIQ's procurement assistant.
PR: {pr.pr_id}, Amount: ${pr.amount:,}, Category: {pr.category}, Supplier: {pr.supplier}
Does this PR need finance approval? Answer yes or no with one reason."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )

    return {"pr_id": pr.pr_id, "pico_response": response.choices[0].message.content}
