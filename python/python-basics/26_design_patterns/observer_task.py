# Observer Pattern — one subject change notifies many subscribers automatically.
# Task: on PR approval, notify email, audit log, and supplier listeners.

class PRApprovalEvent:
    def __init__(self):
        self.listeners = []

    def subscribe(self, fn):
        self.listeners.append(fn)

    def approve(self, pr_id):
        print(f"{pr_id} approved")
        for notify in self.listeners:
            notify(pr_id)

def send_email(pr_id):
    print(f"Email sent for {pr_id}")

def update_audit(pr_id):
    print(f"Audit log updated for {pr_id}")

def notify_supplier(pr_id):
    print(f"Supplier notified for {pr_id}")

event = PRApprovalEvent()
event.subscribe(send_email)
event.subscribe(update_audit)
event.subscribe(notify_supplier)

event.approve("PR-101")
