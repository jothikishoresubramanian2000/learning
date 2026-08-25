# Registry Pattern — central dict mapping a key to its handler function.
# Task: route PRs to category-specific approval handlers with threshold rules.

def check_it(pr):
        threshold = 50000
        needs = pr['amount'] > threshold
        return f'{pr['pr_id']}| {pr['category']}| Approver: IT Manager | Threshold: 50000 | Needs Approval: {needs}'
        
def check_hardware(pr):
        threshold = 100000
        needs = pr['amount'] > threshold
        return f'{pr['pr_id']}| {pr['category']}| Approver: Finance Head | Threshold: 100000 | Needs Approval: {needs}'
        
def check_office(pr):
        threshold = 20000
        needs = pr['amount'] > threshold
        return f'{pr['pr_id']}| {pr['category']}| Approver: Team Lead | Threshold: 20000 | Needs Approval: {needs}'
register = {
     "IT" : check_it,
     "Hardware": check_hardware,
     "Office": check_office
}

prs = [
    {"pr_id": "PR-101", "category": "IT",       "amount": 80000},
    {"pr_id": "PR-202", "category": "Hardware",  "amount": 150000},
    {"pr_id": "PR-303", "category": "Office",    "amount": 12000},
]

for pr in prs:
    result = register[pr['category']](pr)
    print(result)
