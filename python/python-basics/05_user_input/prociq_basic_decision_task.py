# Task: Build an interactive ProcIQ basic decision checker.
supplier = input("Enter supplier:")
amount = int(input("Enter amount:"))
department = input("Enter the department:")
extracted_text = input("Enter text:")

supplier = (supplier.strip()).lower()
department = (department.strip()).upper()
extracted_text = extracted_text.strip()

print(f"Supplier: {supplier}\nDepartment: {department}\nAmount: {amount}")

if extracted_text:
    print("Text extracted")
else:
    print("Text missing")

if amount > 100000:
    print("Finance approval needed")
else:
    print("Auto approval possible")


