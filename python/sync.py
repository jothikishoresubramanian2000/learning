# Topic 1: Sync programming - shows PR checks running one after another.

# Predefined library: time gives current time and blocking sleep().
import time


# User-defined function: simulate a slow budget check for one department.
def check_budget(department):
    print(f"  Checking budget for {department}...")
    time.sleep(2)  # simulates DB call taking 2 seconds
    print(f"  Budget OK for {department}")
    return True


# User-defined function: process one PR by checking budget, then marking it done.
def process_pr(pr_id, department):
    print(f"Processing PR-{pr_id} for {department}")
    check_budget(department)
    print(f"PR-{pr_id} done\n")

# 3 PRs submitted at same time
start = time.time()

process_pr(1, "Finance")
process_pr(2, "Marketing")
process_pr(3, "IT")

print(f"Total time: {time.time() - start:.1f} seconds")
