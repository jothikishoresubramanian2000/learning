supplier_requests = [" Cisco ", "blocked", " Dell ", " HP ", "blocked", " Lenovo "]
approved_suppliers = []

while len(supplier_requests) > 0:
    item = supplier_requests.pop(0)
    item = item.strip()

    if item == "blocked":
        continue
    else:
        approved_suppliers.append(item)

print(f'Approved suppliers: {approved_suppliers}')
print(f'Approved count: {len(approved_suppliers)}')