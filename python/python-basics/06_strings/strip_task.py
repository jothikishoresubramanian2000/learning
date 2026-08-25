# Task: Clean outer spaces with strip().
supplier = "  Cisco"
expected_supplier = "Cisco"

supplier = supplier.strip()
print(supplier)
print(supplier == expected_supplier)