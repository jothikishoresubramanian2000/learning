# Task: Handle multiple decisions with elif.
amount = int(input("Enter the amount:"))

if amount > 100000:
    print("Finance approval needed")

elif amount > 5000 and amount < 100000:
    print("Manager approval needed")

else:
    print("Auto approval possible")