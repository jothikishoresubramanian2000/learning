# Two parallel async GET calls using httpx AsyncClient and asyncio.gather
import asyncio
import httpx


async def calls():
    async with httpx.AsyncClient() as client:
        supplier, budget = await asyncio.gather(
            client.get("https://httpbin.org/get"),
            client.get("https://httpbin.org/get")
        )
        print(supplier.status_code)
        print(budget.status_code)

asyncio.run(calls())