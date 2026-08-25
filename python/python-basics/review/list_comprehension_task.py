prs = [
    {"pr_id": "PR-101", "amount": 50000,  "category": "IT"},
    {"pr_id": "PR-102", "amount": 120000, "category": "Hardware"},
    {"pr_id": "PR-103", "amount": 8000,   "category": "Office"},
    {"pr_id": "PR-104", "amount": 250000, "category": "IT"},
]

pr_ids = [pr['pr_id'] for pr in prs]
print(pr_ids)

its_prs = [pr for pr in prs if pr['category'] == 'IT']

print(its_prs)

big_amount = [pr['amount'] for pr in prs if pr['amount'] > 100000]
print(big_amount)

formatted = [f'{pr['pr_id']}: ${pr['amount']:,}' for pr in prs]
print(formatted)