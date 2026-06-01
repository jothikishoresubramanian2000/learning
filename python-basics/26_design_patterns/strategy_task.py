pr1 = {"pr_id": "PR-101", "supplier": "Cisco", "amount": 50000}
pr2 = {"pr_id": "PR-099", "supplier": "Cisco", "amount": 50200}

class ExactMatch:
    def __init__(self):
        pass

    def check(self,pr1,pr2):
        return pr1['supplier'] == pr2['supplier'] and pr1['amount'] == pr2['amount']

class FuzzyMatch:
    def __init__(self):
        pass

    def check(self,pr1,pr2):
        return pr1['supplier'] == pr2['supplier'] and abs(pr1['amount'] - pr2['amount'])< 500


class DedupChecker:
    def __init__(self, strategy):
        self.strategy = strategy

    def is_duplicate(self,pr1,pr2):
        return self.strategy.check(pr1,pr2)

strategy_registry = {
    "IT": FuzzyMatch(),
    "Office Supplies": ExactMatch()
}

categories = ["IT", "Office Supplies"]

for category in categories:
    checker = DedupChecker(strategy_registry[category])
    result = checker.is_duplicate(pr1,pr2)
    label = "duplicate found" if result else "not duplicate"
    print(f"{category}: {result} — {label}")
        