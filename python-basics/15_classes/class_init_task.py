# Class with __init__ storing supplier name as instance variable
class Supplier:
    def __init__(self,supplier_name):
        self.supplier_name = supplier_name

supplier_cisco = Supplier('Cisco')

print(supplier_cisco.supplier_name)