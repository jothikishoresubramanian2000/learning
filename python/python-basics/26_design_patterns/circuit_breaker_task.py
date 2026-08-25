# Circuit Breaker — after repeated failures, stop calling the failing service.
# States: CLOSED (normal) -> OPEN (reject instantly) -> HALF-OPEN (test one call).

import time


# ── flaky service — always fails here so the breaker trips ──
def call_erp():
    raise Exception("ERP timeout")


class CircuitBreaker:
    def __init__(self, fail_threshold=3, cooldown=5):
        self.fail_threshold = fail_threshold   # fails allowed before opening
        self.cooldown = cooldown               # seconds before testing again
        self.failures = 0                      # current fail count
        self.state = "CLOSED"                  # start healthy
        self.opened_at = None                  # time circuit opened

    def call(self, func, *args):
        # OPEN: reject instantly, unless cooldown passed -> then test once
        if self.state == "OPEN":
            if time.time() - self.opened_at >= self.cooldown:
                self.state = "HALF-OPEN"
                print("Cooldown passed -> HALF-OPEN, testing one call...")
            else:
                print("Circuit OPEN — rejecting call instantly")
                return

        # try the real call
        try:
            result = func(*args)
            self.failures = 0          # success -> reset
            self.state = "CLOSED"
            print(f"Success: {result}")
            return result
        except Exception as e:
            self.failures += 1
            print(f"Failure {self.failures}: {e}")
            if self.failures >= self.fail_threshold:
                self.state = "OPEN"
                self.opened_at = time.time()
                print("Threshold hit -> circuit OPEN")


# ── run: 6 calls, 1s apart ──
breaker = CircuitBreaker(fail_threshold=3, cooldown=5)

for i in range(6):
    breaker.call(call_erp)
    time.sleep(1)
