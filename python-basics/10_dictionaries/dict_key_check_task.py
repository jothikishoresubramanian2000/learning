purchase_request = {
    'pr_id': 101,
    'supplier': 'Cisco',
    'amount': 240000
}

if 'supplier' in purchase_request:
    print('Supplier exists')
else:
    print('Supplier missing')

if 'status' in purchase_request:
    print('Status exists')
else:
    print('Status missing')