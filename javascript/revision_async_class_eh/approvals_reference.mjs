// Reference — approvals module (named error export + default service export)

// Named export: the custom error type
export class DuplicateApprovalError extends Error {
  constructor(message) {
    super(message);
    this.name = "DuplicateApprovalError";
  }
}

// Default export: the service. All state is private (#) — outside code can
// only go through the methods.
export default class ApprovalService {
  #approvedPrs = new Set();   // which PR ids are already approved
  #countsByUser = new Map();  // user → number of approvals

  // Synchronous on purpose: no waiting is involved, so no Promise/async.
  record(user, prId) {
    if (this.#approvedPrs.has(prId)) {
      throw new DuplicateApprovalError(`${prId} already approved`);
    }
    this.#approvedPrs.add(prId);
    // tally pattern: current-or-0, +1, set back
    this.#countsByUser.set(user, (this.#countsByUser.get(user) || 0) + 1);
  }

  counts() {
    return new Map(this.#countsByUser);   // copy, so callers can't mutate our state
  }

  get total() {                           // read-only via getter
    return this.#approvedPrs.size;
  }
}
