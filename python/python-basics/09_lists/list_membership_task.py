supplier_list = ['Cisco', 'Dell', 'HP']

query = input("Enter:")

query = query.strip()

if query in supplier_list:
    print("Supplier approved")
else:
    print("Supplier not approved")