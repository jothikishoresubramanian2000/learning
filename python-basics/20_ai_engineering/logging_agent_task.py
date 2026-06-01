# Logs every Pico decision with timestamp; warns on High risk PRs
import logging
import os, json
from groq import Groq
from pydantic import BaseModel

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s — %(levelname)s — %(message)s"
)

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

class PicoDecision(BaseModel):
    pr_id: str
    needs_approval: bool
    reason: str
    risk_level: str

def check_pr(pr: dict) -> PicoDecision:
    logging.info(f"Pico checking {pr['pr_id']} — amount ${pr['amount']:,}")

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": f"""You are Pico, ProcIQ's procurement AI.

PR Details:
- PR ID: {pr['pr_id']}
- Amount: ${pr['amount']:,}
- Category: {pr['category']}

Rules:
- needs_approval: true if amount > 100000, else false
- risk_level: "High" if amount > 500000, "Medium" if 100000-500000, "Low" if under 100000

Respond ONLY in this exact JSON, no other text:
{{"pr_id": "{pr['pr_id']}", "needs_approval": true/false, "reason": "one sentence explaining the rule applied", "risk_level": "Low/Medium/High"}}"""}]
    )

    raw = response.choices[0].message.content
    result = PicoDecision(**json.loads(raw))

    logging.info(f"Pico decision for {result.pr_id} — approval: {result.needs_approval} — risk: {result.risk_level}")
    if result.risk_level == "High":
        logging.warning(f"{result.pr_id} flagged High risk — handoff may trigger")

    return result

pr1 = {"pr_id": "PR-101", "amount": 150000, "category": "IT"}
check_pr(pr1)
pr2 = {"pr_id": "PR-102", "amount": 15550000, "category": "EE"}
check_pr(pr2)