let amounts = [1200, 8000, 450, 15000, 300]

let total = amounts
    .filter(amts => amts>1000)
    .reduce((acc,n)=>acc +n,0)

console.log(total)

