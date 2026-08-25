# Function with type hints — amount: int input, bool return
def finance_approval(amount: int) -> bool:
    return amount > 100000
    
print(finance_approval(240000))
