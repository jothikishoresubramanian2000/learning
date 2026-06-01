class PRRepository:

    def __init__(self):
        self.db = {}
    
    def add(self, pr):
        self.db[pr['pr_id']] = pr
    
    def get(self,pr_id):
        return self.db.get(pr_id)
    
    def update(self,pr_id, status):
        self.db[pr_id]['status'] = status

    def get_all(self):
        return self.db
    

pr1 = {'pr_id': 'PR-101', 'amount': 50000, 'status': 'Draft'}
pr2 = {'pr_id': 'PR-102', 'amount': 120000, 'status': 'Draft'}

repo1 = PRRepository()

repo1.add(pr1)
repo1.add(pr2)

pr_result = repo1.get('PR-101')
print(pr_result)

repo1.update('PR-101','Approved')

print('---- after update -----')

pr_result = repo1.get_all()

for pr in pr_result.values():
    print(pr)