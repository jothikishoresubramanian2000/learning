# Makes GET request to httpbin and prints status code
import requests

response = requests.get("https://httpbin.org/get")

print(response.status_code)