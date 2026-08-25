# Builds structured Pico prompt from PR data dict using f-string template
prs = {
    'pr1' : {"pr_id": "PR-101", "amount": 50000, "category": "IT", "supplier": "Cisco"},
    'pr2' : {"pr_id": "PR-202", "amount": 150000, "category": "Hardware", "supplier": "Dell"}
}

def build_pico_prompt(pr):
    prompt = f"""You are Pico, ProcIQ's procurement assistant.

PR Details:
- PR ID: {pr['pr_id']}
- Amount: ${pr['amount']:,}
- Category: {pr['category']}
- Supplier: {pr['supplier']}

Task: Check if this PR needs finance approval. Answer yes or no with one reason"""
    return prompt

response = build_pico_prompt(prs['pr1'])
print(response)

response2 = build_pico_prompt(prs['pr2'])
print(response2)
