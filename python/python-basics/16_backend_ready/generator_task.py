# Generator yielding three supplier names one at a time; demo with next()
def supplier_names():
    yield 'Cisco'
    yield 'Dell'
    yield 'HP'

for suppliers in supplier_names():
    print(suppliers)

def supplier_names():
    yield 'Cisco'
    yield 'Dell'
    yield 'HP'

gen = supplier_names()       # generator created — nothing runs yet

print(next(gen))             # runs until first yield
print("--- doing other work ---")
print(next(gen))             # runs until second yield
print("--- doing other work ---")
print(next(gen))             # runs until third yield
