# Catches HTTP 500 error using raise_for_status and HTTPError handler
import requests

try:
    response = requests.get("https://httpbin.org/status/500")
    response.raise_for_status()

except requests.exceptions.HTTPError:
    print("HTTP error occurred")