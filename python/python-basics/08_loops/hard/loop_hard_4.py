# Task: Skip PR-4 and stop at PR-8.
for number in range(1,11):
    if number == 4:
        continue
    print(f"PR-{number}")
    if number == 8:
        break

    