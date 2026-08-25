# Catches ValueError when user enters non-numeric input
try:
    amount = int(input("Enter amount: "))
    print(f'Amount: {amount}')
except ValueError:
    print("Invalid amount")