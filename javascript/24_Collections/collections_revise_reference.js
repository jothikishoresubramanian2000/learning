// Reference — Set (distinct) + Map (count + sum per group)

const prs = [
  { dept: "IT",  amount: 5000 },
  { dept: "HR",  amount: 2000 },
  { dept: "IT",  amount: 3000 },
  { dept: "FIN", amount: 8000 },
  { dept: "IT",  amount: 1000 },
];

const counts = new Map();   // dept -> number of PRs
const totals = new Map();   // dept -> summed amount

for (const pr of prs) {
  // tally pattern: current value (or 0 if first time), then update, set back.
  // No if/else needed — `|| 0` handles the "not seen yet" case.
  counts.set(pr.dept, (counts.get(pr.dept) || 0) + 1);
  totals.set(pr.dept, (totals.get(pr.dept) || 0) + pr.amount);
}

// 1. distinct departments — Set drops duplicates
const distinct = [...new Set(prs.map((pr) => pr.dept))];
console.log(distinct);

// 2. count per dept — format each line
for (const [dept, count] of counts) {
  console.log(`${dept}: ${count} PRs`);
}

// 3. total per dept
for (const [dept, total] of totals) {
  console.log(`${dept} total: ${total}`);
}

// Expected:
//   [ 'IT', 'HR', 'FIN' ]
//   IT: 3 PRs
//   HR: 1 PRs
//   FIN: 1 PRs
//   IT total: 9000
//   HR total: 2000
//   FIN total: 8000
