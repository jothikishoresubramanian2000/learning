# Loops PR line items and prints item, qty, price with em dash formatting
pr_lines = [
    {"item": "Laptop", "qty": 10, "price": 999.99},
    {"item": "Mouse", "qty": 20, "price": 29.99},
    {"item": "Keyboard", "qty": 15, "price": 49.99}
]

for lists in pr_lines:
    print(f"{lists['item']} — qty: {lists['qty']} — price: {lists['price']}")