import time
import asyncio

async def check_budget(department):
    print(f"  Checking budget for {department}...")
    await asyncio.sleep(2)  # simulates DB call taking 2 seconds
    print(f"  Budget OK for {department}")
    return True

async def process_pr(pr_id, department):
    print(f"Processing PR-{pr_id} for {department}")
    await check_budget(department)
    print(f"PR-{pr_id} done\n")

async def main():
    start = time.time()

    await asyncio.gather(
        process_pr(1, "Finance"),
        process_pr(2, "Marketing"),
        process_pr(3, "IT"),
    )

    print(f"Total time: {time.time() - start:.1f} seconds")

asyncio.run(main())
