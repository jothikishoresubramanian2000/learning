# Review task — Phases 1-15 combined. ProcIQ supplier-PR matching.

# ── data ──
suppliers = [
    {"id": "SUP-001", "name": "Cisco Systems",  "risk": "low"},
    {"id": "SUP-002", "name": "Dell Inc",       "risk": "medium"},
    {"id": "SUP-003", "name": "HP Enterprise",  "risk": "low"},
    {"id": "SUP-004", "name": "Unknown Vendor", "risk": "high"},
]

prs = [
    {"pr_id": "PR-101", "supplier_name": "  CISCO SYSTEMS  ", "amount": 50000,  "category": "IT"},
    {"pr_id": "PR-102", "supplier_name": "dell inc",          "amount": 120000, "category": "Hardware"},
    {"pr_id": "PR-103", "supplier_name": "HP Enterprise",     "amount": 8000,   "category": "Office"},
    {"pr_id": "PR-104", "supplier_name": "Random Co",         "amount": 75000,  "category": "IT"},
    {"pr_id": "PR-105"},   # broken — missing keys
]


# ── helpers ──
def clean_supplier_name(name: str) -> str:
    return name.strip().lower()


def find_supplier(cleaned_name: str, suppliers: list) -> dict | None:
    for supplier in suppliers:
        if supplier["name"].lower() == cleaned_name:
            return supplier
    return None


def classify_pr(amount: float) -> str:
    if amount > 100000:
        return "High"
    elif amount > 50000:
        return "Medium"
    return "Low"


# ── report tracker ──
class PRReport:
    def __init__(self):
        self.total_processed = 0
        self.matched = 0
        self.unmatched = 0
        self.high_risk_count = 0

    def add_result(self, matched: bool, risk: str):
        self.total_processed += 1
        if matched:
            self.matched += 1
            if risk in ("medium", "high"):
                self.high_risk_count += 1
        else:
            self.unmatched += 1

    def summary(self) -> str:
        return (
            f"Total processed: {self.total_processed}\n"
            f"Matched: {self.matched}\n"
            f"Unmatched: {self.unmatched}\n"
            f"High risk (medium/high suppliers): {self.high_risk_count}"
        )


# ── main loop ──
report = PRReport()

for pr in prs:
    try:
        cleaned = clean_supplier_name(pr["supplier_name"])
        supplier = find_supplier(cleaned, suppliers)
        priority = classify_pr(pr["amount"])

        if supplier:
            print(f"{pr['pr_id']} | {supplier['name']} | ${pr['amount']:,} | {pr['category']} | Risk: {supplier['risk']} | Priority: {priority}")
            report.add_result(matched=True, risk=supplier["risk"])
        else:
            print(f"{pr['pr_id']} | \"{pr['supplier_name']}\" not in approved list | flagged for review")
            report.add_result(matched=False, risk="")
    except KeyError:
        print("Bad PR data — skipped")

print("---")
print(report.summary())
