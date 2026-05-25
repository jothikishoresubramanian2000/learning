# Task: Clean supplier name manually and lowercase it.
supplier_name = input("Enter the supplier name: ")

supplier_name = supplier_name.strip().lower()

clear_name =""

for char in supplier_name:
    if char != " ":
        clear_name += char

print(clear_name)