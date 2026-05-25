# Task: Practice an if inside another if.
amount = 240000
supplier_approved = False

if amount > 100000:
    if(supplier_approved):
        print("Send to Finance")
    else:
        print("Supplier approval missing")
else:
    print("Auto approval possible")