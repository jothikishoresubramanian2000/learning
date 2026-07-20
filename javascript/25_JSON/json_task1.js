const pr={
    id: "PR-001",
    amount: 5000,
    approved: true
}

const json = JSON.stringify(pr)
const back = JSON.parse(json)
console.log(json)
console.log(back.amount)