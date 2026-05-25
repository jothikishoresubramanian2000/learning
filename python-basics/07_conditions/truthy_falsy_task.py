# Task: Practice truthy and falsy checks.
supplier = ""
amount = 0
extracted_text = "PDF text found"

if supplier:
    print("Supplier extracted")
else:
    print("Supplier missing")
    
if amount:
    print("Amount extracted")
else:
    print("Amount missing")

if extracted_text:
    print("Text extracted")
else:
    print("Text missing")