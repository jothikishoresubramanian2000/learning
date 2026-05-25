def process_amount(amount, tax):

    value = amount + tax
    return value

grand_total = process_amount(240000, 1000)
print(grand_total)