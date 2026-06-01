# Loads JSON file and accesses supplier and amount fields
import json

with open('python-basics/13_files_json/purchase_request.json', 'r') as file:
    content = json.load(file)

print(content['supplier'])
print(content['amount'])