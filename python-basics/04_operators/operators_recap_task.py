# Task: Recap multiple operator types together.
amount = 240000
finance_limit = 100000
department = "IT"
supplier = "Cisco"
document_text = "Cisco supplier is approved for IT purchases"
extracted_text = None

amount+=finance_limit
print(amount)
amount -=(finance_limit * 2)
print(amount)
print(department is not None)
print(department != supplier)
print(amount<500000 )
print("Cisco" in document_text)
print("Missing text" if extracted_text is None else "Text available")