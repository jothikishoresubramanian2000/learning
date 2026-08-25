# Retry with Exponential Backoff — retry failed calls with growing delay (1s, 2s, 4s).
# Task: retry a flaky ERP sync up to 4 times with doubling backoff between attempts.

import time
import random

def sync_to_erp(po_id):
    # simulate flaky ERP — fails randomly
    if random.random() < 0.7:
        raise Exception("ERP timeout")
    return f"{po_id} synced"

def sync_with_retry(po_id, max_retries=4):
    delay = 1
    for attempt in range(max_retries):
        try:
            result = sync_to_erp(po_id)
            print(f"Success: {result}")
            return result 
        except Exception as e:
            print(f"Attempt {attempt + 1} failed: {e}")
            if attempt < max_retries - 1:
                print(f"Retrying in {delay}s...")
                time.sleep(delay)
                delay *= 2
    print(f"{po_id} sync failed after {max_retries} attempts")

sync_with_retry("PO-5001")
