# Sends GET with custom ProcIQ headers and prints echoed response body
import requests

headers = {
    "X-App-Name": "ProcIQ",
    "X-Version": "1.0"
}

response = requests.get("https://httpbin.org/headers", headers=headers)

print(response.status_code)
print(response.json())