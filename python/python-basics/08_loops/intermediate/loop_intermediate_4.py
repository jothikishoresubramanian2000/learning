# Task: Remove spaces from supplier name manually.
supplier = " C i s c o "
length = len(supplier)
clear =""

for char in supplier:
    if char != " ":
        clear += char

print(clear)