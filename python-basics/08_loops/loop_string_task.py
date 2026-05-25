# Task: Count digits while looping through a string.
pr_code = "PR-101"
count = 0

for char in pr_code:
    if char >= "0" and char <= "9":
        count += 1

print(count)