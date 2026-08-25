# Dependency Injection — pass dependencies in from outside, don't create inside.
# Same function works with real repo OR fake repo, just by injecting a different one.

# ── real repository ──
class PRRepository:
    def __init__(self):
        self.db = {}

    def add(self, pr):
        self.db[pr["pr_id"]] = pr

    def get(self, pr_id):
        return self.db.get(pr_id)


# ── fake repository — for testing, no real DB ──
class FakeRepo:
    def get(self, pr_id):
        return {"pr_id": pr_id, "amount": 1, "status": "Test"}


# ── business logic — repo INJECTED as a parameter ──
def get_pr_summary(pr_id, repo):
    pr = repo.get(pr_id)
    return f"{pr['pr_id']} | ${pr['amount']:,} | {pr['status']}"


# ── use with real repo ──
real_repo = PRRepository()
real_repo.add({"pr_id": "PR-101", "amount": 50000, "status": "Draft"})
print("Real:", get_pr_summary("PR-101", real_repo))

# ── use with fake repo — same function, no change ──
fake_repo = FakeRepo()
print("Fake:", get_pr_summary("PR-999", fake_repo))
