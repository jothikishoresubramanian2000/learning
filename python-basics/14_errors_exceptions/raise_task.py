# Raises ValueError manually when amount is negative
amount = int(input("Enter amount: "))

if amount < 0:
    raise ValueError('Amount cannot be negative')

print(f'Amount: {amount}')