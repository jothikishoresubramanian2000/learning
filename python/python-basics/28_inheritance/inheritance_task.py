class ProcIQUser:
    def __init__(self, name, tenant_id):
        self.name = name
        self.tenant_id = tenant_id

    def whoami(self):
        print(f'{self.name} on {self.tenant_id}')

class Buyer(ProcIQUser):
    
    def raise_pr(self, item):
        print(f'{self.name} raised PR for {item}')

class Approver(ProcIQUser):

    def __init__(self, name, tenant_id, approval_limit):
        super().__init__(name, tenant_id)
        self.approval_limit = approval_limit

    def approve(self,amount):
        if amount <= self.approval_limit:
            print(f'{self.name} approved {amount}')
        else:
            print(f'{self.name} rejected (over limit {self.approval_limit})')

b = Buyer("Kishore", "tenant-1")
b.whoami()

c = Approver("Asha", "tenant-1",50000)
c.whoami()

b.raise_pr("laptop")
c.approve(30000)
c.approve(100000)