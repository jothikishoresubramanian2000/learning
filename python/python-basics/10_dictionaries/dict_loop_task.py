purchase_request = {
    'pr_id': 101,
    'supplier': 'Cisco',
    'amount': 240000,
    'status': 'Draft'
}

for key in purchase_request:
    print(f'{key}: {purchase_request[key]}')