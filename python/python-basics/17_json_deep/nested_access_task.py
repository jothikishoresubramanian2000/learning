# Drills into 3-level nested dict to access supplier contact and address
supplier = {
    "id": "SUP-001",
    "contact": {
        "name": "Alice",
        "email": "alice@cisco.com",
        "address": {
            "city": "San Jose",
            "country": "USA"
        }
    }
}

print(supplier['contact']['name'])
print(supplier["contact"]['email'])
print(supplier["contact"]['address']['city'])
print(supplier["contact"]['address']['country'])