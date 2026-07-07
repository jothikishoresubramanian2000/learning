# Strategy Pattern — swap behaviour at runtime; caller code stays unchanged.
# Task: validate price variance per category using different tolerance strategies via registry.

prs = [
    {"pr_id": "PR-101", "category": "IT",             "last_price": 50000, "new_price": 58000},
    {"pr_id": "PR-202", "category": "Office Supplies", "last_price": 500,   "new_price": 530},
    {"pr_id": "PR-303", "category": "Hardware",        "last_price": 80000, "new_price": 94000},
]

class Handleit():
    def __init__(self):
        pass

    def variation(self, pr):
        tolerance = 20
        variance = round(abs(pr['new_price'] - pr['last_price']) / pr['last_price'] * 100)
        within_tolerance = variance < tolerance
        return f'{pr['pr_id']} | {pr['category']} | Variance: {variance}% | Within tolerance: {within_tolerance}'

class HandleOffice():
    def __init__(self):
        pass

    def variation(self, pr):
        tolerance = 5
        variance = round(abs(pr['new_price'] - pr['last_price']) / pr['last_price'] * 100)
        within_tolerance = variance < tolerance
        return f'{pr['pr_id']} | {pr['category']} | Variance: {variance}% | Within tolerance: {within_tolerance}'

class HandleHardware():
    def __init__(self):
        pass

    def variation(self, pr):
        tolerance = 15
        variance = round(abs(pr['new_price'] - pr['last_price']) / pr['last_price'] * 100)
        within_tolerance = variance < tolerance
        return f'{pr['pr_id']} | {pr['category']} | Variance: {variance}% | Within tolerance: {within_tolerance}'

register = {
    "IT": Handleit(),
    "Office Supplies": HandleOffice(),
    "Hardware": HandleHardware()
}

class PurchaseChecker:
    def __init__(self,strategy):
        self.strategy = strategy

    def check_price(self,pr):
        return self.strategy.variation(pr)
    
for pr in prs:
    checker = PurchaseChecker(register[pr['category']])
    result = checker.check_price(pr)
    print(result)