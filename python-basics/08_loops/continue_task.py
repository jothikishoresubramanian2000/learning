# Task: Skip one loop round using continue.
for pr_id in range(1, 6):
    if pr_id == 3:
        continue

    print(f"Processing PR-{pr_id}")
