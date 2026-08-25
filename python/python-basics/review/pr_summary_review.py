prs = [
    {"pr_id": "PR-101", "supplier": "cisco", "amount": 50000, "category": "IT"},
    {"pr_id": "PR-102", "supplier": "DELL", "amount": 120000, "category": "Hardware"},
    {"pr_id": "PR-103", "supplier": "hp", "amount": 8000, "category": "Office"},
    {"pr_id": "PR-104","supplier": "Cisco", "amount": 250000, "category": "IT"},
    {"pr_id": "PR-105"}
]

class PrSummary:
    def __init__(self, pr_id, supplier,amount,category):
        self.pr_id = pr_id
        self.supplier = supplier
        self.amount = amount
        self.category = category

    def clean_supplier(self):
        self.supplier = self.supplier.strip().capitalize()

    def need_approval(self) -> bool:
        return self.amount > 100000

pr_objects = []

total = 0
approval_count = 0

for pr in prs:
    try:
        pr_obj = PrSummary(pr['pr_id'], pr['supplier'], pr['amount'], pr['category'])
        pr_objects.append(pr_obj)
        pr_obj.clean_supplier()
        approval = pr_obj.need_approval()
        if approval:
            approval_count += 1
        total += pr_obj.amount
        print(f'{pr_obj.pr_id} | {pr_obj.supplier} | {pr_obj.amount:,} | {pr_obj.category} | Approval: {approval}')
    except KeyError:
        print("Bad PR data")

print('-----')
print(f"PRs needing approval: {approval_count}")
print(f'Total amount {total:,}')