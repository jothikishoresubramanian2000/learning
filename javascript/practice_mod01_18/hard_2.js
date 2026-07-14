let prs = [
  { id: "PR-002", amount: 12000 },
  { id: "PR-001", amount: 5000  },
  { id: "PR-003", amount: 20000 }
]

let sortedAsc = prs
.sort((a,b)=>a.amount-b.amount)
.map(id => id.id)

console.log((sortedAsc));
console.log(sortedAsc[sortedAsc.length -1])
