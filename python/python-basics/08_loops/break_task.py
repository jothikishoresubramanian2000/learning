# Task: Stop a loop early using break.
for pr_id in range(1,6):
    print(f"Checking PR-{pr_id}")

    if pr_id == 3:
        print("PR found")
        break
    