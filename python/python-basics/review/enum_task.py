from enum import Enum

class PRStatus(str, Enum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

def describe(status):
    messages = {
        PRStatus.DRAFT:     "PR is still being drafted.",
        PRStatus.SUBMITTED: "PR has been submitted for approval.",
        PRStatus.APPROVED:  "PR is approved.",
        PRStatus.REJECTED:  "PR was rejected.",
    }
    return messages[status]

print(PRStatus.SUBMITTED)          # PRStatus.SUBMITTED
print(PRStatus.SUBMITTED.name)     # SUBMITTED
print(PRStatus.SUBMITTED.value)    # SUBMITTED
print(describe(PRStatus.APPROVED)) # PR is approved.
print(PRStatus.DRAFT == "DRAFT")   # True   <- proves the str trick