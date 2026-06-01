# finally block runs regardless of error or success
try:
    amount = int(input("Enter amount: "))
    print(f'Amount: {amount}')
except ValueError:
    print("Invalid amount")
finally:
    print('Validation finished')