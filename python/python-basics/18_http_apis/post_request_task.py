# POSTs supplier data as JSON body and prints echoed response
import requests

pr = {
    "supplier_id": "SUP-001",
    "name": "Dell",
    "risk_level": "Low"
}

response = requests.post("https://httpbin.org/post", json=pr)
print(response.status_code)
print(response.json()['json'])