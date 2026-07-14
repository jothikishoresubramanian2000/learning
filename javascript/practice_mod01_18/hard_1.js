const prs = [
  { id: "PR-001", dept: "IT", amount: 5000,  approved: true  },
  { id: "PR-002", dept: "HR", amount: 12000, approved: false },
  { id: "PR-003", dept: "IT", amount: 20000, approved: true  },
  { id: "PR-004", dept: "IT", amount: 3000,  approved: false }
]

let itPrs = prs
    .filter(it => it.dept ==="IT" && it.approved === true)
    .reduce((acc,n)=>acc+n.amount,0)

console.log(itPrs)