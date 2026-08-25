# Task: Count digits in a PR code.
pr_code = "PR-2026-105"
count = 0
for number in pr_code:
    if number >= '0' and number <='9':
        count += 1

print(count)