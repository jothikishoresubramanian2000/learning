# Accesses specific items inside a list of approval chain dicts by index
approval_chain = [
    {"approver": "Manager", "status": "approved"},
    {"approver": "Finance", "status": "pending"},
    {"approver": "CFO", "status": "not_reached"}
]

print(approval_chain[0]['approver'])
print(approval_chain[1]['status'])
print(approval_chain[2]['status'])