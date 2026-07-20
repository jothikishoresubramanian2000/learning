// Reference — consumer. One import line for default + named.
import ApprovalService, { DuplicateApprovalError } from "./approvals_reference.mjs";

const service = new ApprovalService();

// helper: try one approval; on duplicate print Blocked and CONTINUE.
// (the service throws = the operation fails; we catch = the program survives)
function tryRecord(user, prId) {
  try {
    service.record(user, prId);
  } catch (err) {
    if (err instanceof DuplicateApprovalError) {
      console.log(`Blocked: ${err.message}`);
    } else {
      throw err;                 // not ours — bubble up
    }
  }
}

tryRecord("Kishore", "PR-001");
tryRecord("Jk", "PR-002");
tryRecord("Kishore", "PR-003");
tryRecord("Jk", "PR-001");       // duplicate → Blocked line, program continues

for (const [user, count] of service.counts()) {
  console.log(`${user}: ${count}`);
}
console.log(`total: ${service.total}`);   // getter — no parentheses

// Expected:
//   Blocked: PR-001 already approved
//   Kishore: 2
//   Jk: 1
//   total: 3
