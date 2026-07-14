let prs = [
  { id: "PR-001", dept: "IT",  amount: 5000 },
  { id: "PR-002", dept: "HR",  amount: 12000 },
  { id: "PR-003", dept: "IT",  amount: 8000 }
]

let itPrs = prs
    .filter(pr => pr.dept === "IT")
    .map(ids => ids.id)

let total = prs.reduce((acc,n) => acc+n.amount,0)
console.log(itPrs);
console.log(total)

