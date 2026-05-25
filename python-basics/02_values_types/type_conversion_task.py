# Task: Convert values between strings and numbers.
amount = int(input("Enter the amount:"))
tax_text = input("Enter the tax text:")
pr_id = int(input("Enter pr id:"))
tax_text = int(tax_text)

amount += tax_text
message = 'PR-' + str(pr_id)
print(amount)
print(message)
