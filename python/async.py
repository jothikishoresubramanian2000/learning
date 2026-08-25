# Topic 1: Async programming - shows PR checks running concurrently.

# Predefined library: time measures total runtime.
import time

# Predefined library: asyncio runs async functions and concurrent tasks.
import asyncio


# User-defined async function: simulate a slow non-blocking budget check.
async def check_budget(department):
    print(f"  Checking budget for {department}...")
    await asyncio.sleep(2)  # simulates DB call taking 2 seconds
    print(f"  Budget OK for {department}")
    return True


# User-defined async function: process one PR after awaiting its budget check.
async def process_pr(pr_id, department):
    print(f"Processing PR-{pr_id} for {department}")
    await check_budget(department)
    print(f"PR-{pr_id} done\n")


# User-defined async function: start all PR tasks together and wait for all.
async def main():
    start = time.time()

    await asyncio.gather(
        process_pr(1, "Finance"),
        process_pr(2, "Marketing"),
        process_pr(3, "IT"),
    )

    print(f"Total time: {time.time() - start:.1f} seconds")

asyncio.run(main())
