# Converts dict to JSON string with dumps, parses back with loads
import json

purchase_request = {
    'supplier': 'Cisco',
    'amount': 240000
}

json_text = json.dumps(purchase_request)
print(json_text)

py_text = json.loads(json_text)
print(py_text['supplier'])
print(py_text['amount'])