# Uses .get() for safe key access, returns default when key missing
pr = {
    "pr_id": "PR-101",
    "amount": 50000,
    "category": "IT"
}

print(pr.get("pr_id", "Not specified"))
print(pr.get("amount", "Not specified"))
print(pr.get("category", "Not specified"))
print(pr.get("supplier", "Not specified"))