# Task: Count vowels in a supplier name.
supplier = "International"
vowels = 'aeiou'
count = 0
for char in supplier:
    if char.lower() in vowels:
        count += 1

print(count)