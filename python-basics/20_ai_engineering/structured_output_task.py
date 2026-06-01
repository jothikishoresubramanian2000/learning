# Forces LLM to return JSON, parses into PicoDecision Pydantic model
from pydantic import BaseModel
from groq import Groq
import os, json

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

class PicoDecision(BaseModel):
    needs_approval: bool
    reason: str
    risk_level: str

def check_pr(pr: dict) -> PicoDecision:
    prompt = f"""You are Pico, ProcIQ's procurement assistant.

PR: {pr['pr_id']}, Amount: ${pr['amount']:,}, Category: {pr['category']}

Respond ONLY in this JSON format, no other text:
{{
  "needs_approval": true or false,
  "reason": "one sentence",
  "risk_level": "Low" or "Medium" or "High"
}}"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )

    raw = response.choices[0].message.content
    data = json.loads(raw)
    return PicoDecision(**data)

pr1 = {"pr_id": "PR-101", "amount": 150000, "category": "IT"}
pr2 = {"pr_id": "PR-202", "amount": 8000, "category": "Office Supplies"}

result = check_pr(pr1)
print(result.needs_approval)
print(result.reason)
print(result.risk_level)

result = check_pr(pr2)
print(result.needs_approval)
print(result.reason)
print(result.risk_level)