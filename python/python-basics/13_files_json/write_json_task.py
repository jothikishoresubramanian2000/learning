# Saves a purchase request dict as formatted JSON file
import json
purchase_request = {
    'pr_id': 101,
    'supplier': 'Cisco',
    'amount': 240000,
    'status': 'Draft'
}

with open('python-basics/13_files_json/purchase_request.json', 'w') as file:
    json.dump(purchase_request, file, indent= 2)