# Decorator Pattern — wrap a function to add behaviour before/after without changing it.
# Task: measure execution time of any function using a @measure_time decorator.

import time

def measure_time(func):
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        elapsed = time.time() - start
        print(f"{func.__name__} took {elapsed:.2f}s")
        return result
    return wrapper

@measure_time
def check_pr():
    time.sleep(0.50)            # simulate LLM call
    return f'PR checked'

status = check_pr()
print(status)
