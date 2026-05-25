# Task: Count letters and digits in a user-given PR code.
pr_code = input("Enter the code: ")
letters = 0 
digits = 0
pr_code = pr_code.lower()
for char in pr_code:
    if char >= 'a' and char <= 'z':
        letters+= 1
    
    if char >= '0' and char <= '9':
        digits += 1

print(f"Letters: {letters}\nDigits: {digits}")