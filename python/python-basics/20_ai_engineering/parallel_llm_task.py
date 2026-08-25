# Checks 3 PRs simultaneously via Groq using asyncio.gather and to_thread
import asyncio
import os, json
from groq import Groq
from pydantic import BaseModel

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

class PicoDecision(BaseModel):
    pr_id: str
    needs_approval: bool
    reason: str
    risk_level: str

def check_pr_async(pr: dict) -> PicoDecision:
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": f"""You are Pico.
PR: {pr['pr_id']}, Amount: ${pr['amount']:,}, Category: {pr['category']}
Respond ONLY in JSON: {{"pr_id":"{pr['pr_id']}","needs_approval": true/false, "reason": "one sentence", "risk_level": "Low/Medium/High"}}"""}]
    )
    raw = response.choices[0].message.content
    return PicoDecision(**json.loads(raw))

async def check_all():
    pr1 = {"pr_id": "PR-101", "amount": 150000, "category": "IT"}
    pr2 = {"pr_id": "PR-202", "amount": 8000, "category": "Office Supplies"}
    pr3 = {"pr_id": "PR-303", "amount": 75000, "category": "Hardware"}


    result1, result2, result3 = await asyncio.gather(
        asyncio.to_thread(check_pr_async, pr1),
        asyncio.to_thread(check_pr_async, pr2),
        asyncio.to_thread(check_pr_async, pr3)
    )

    print(result1.pr_id,result1.needs_approval, result1.risk_level)
    print(result2.pr_id,result2.needs_approval, result2.risk_level)
    print(result3.pr_id,result3.needs_approval, result3.risk_level)

asyncio.run(check_all())
