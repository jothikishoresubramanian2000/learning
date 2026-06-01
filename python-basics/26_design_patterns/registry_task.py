
def handle_it(pr_id):
    return(f'{pr_id} → IT Category Manager')

def handle_hardware(pr_id):
    return(f'{pr_id} → Hardware Category Manager')

def handle_office(pr_id):
    return(f'{pr_id} → Office Category Manager')

registry = {
    "IT" : handle_it,
    "Hardware": handle_hardware,
    "Office": handle_office 
}

prs=[
    {"pr_id": "PR-101", "category": "IT"},
    {"pr_id": "PR-202", "category": "Hardware"}
]

for pr in prs:
    result = registry[pr['category']](pr['pr_id'])
    print(result)