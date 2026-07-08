const costCenter = (budget) =>{
    return {
        spend(amount){return budget = amount<=budget? (budget - amount):"Budget exceeded"}
    }
}

const itBudget = costCenter(10000)
console.log(itBudget.spend(1000));
console.log(itBudget.spend(9000));
console.log(itBudget.spend(1000));
console.log(itBudget.budget);

