# Runs three async checks in parallel using asyncio.gather
import asyncio

async def check_supplier():
    await asyncio.sleep(1)
    return 'Supplier OK'

async def check_budget():
    await asyncio.sleep(1)
    return 'Budget OK'

async def check_policy():
    await asyncio.sleep(1)
    return 'Policy OK'

async def execute_checks():
    results = await asyncio.gather(
    check_supplier(),
    check_budget(),
    check_policy())

    for result in results:
        print(results)

asyncio.run(execute_checks())