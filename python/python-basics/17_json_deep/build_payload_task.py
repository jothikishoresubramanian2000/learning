# Builds Groq API request payload dict from PR data and prints as JSON
import json
pr = {
    "pr_id": "PR-202",
    "amount": 120000,
    "category": "Hardware",
    "supplier": "Dell"
}

payload = {
    "model": "llama-3.3-70b-versatile",
    "messages": [
        {"role": "user","content": f'Does PR {pr["pr_id"]} needs finance approval?'}
    ]
}

print(json.dumps(payload, indent=2))