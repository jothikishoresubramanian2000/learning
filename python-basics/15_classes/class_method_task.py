# PurchaseRequest class with method checking if finance approval needed
class PurchaseRequest:
    def __init__(self, amount):
        self.amount = amount
    
    def needs_finance_approval(self):
        return self.amount > 100000

pr = PurchaseRequest(240000)
print(pr.needs_finance_approval())