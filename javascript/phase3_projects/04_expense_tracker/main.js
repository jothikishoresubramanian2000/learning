const{DuplicateId,ExpenseTracker,InvalideAmount,IdNotFound}=require("./expenseTracker")


const myExpenses = new ExpenseTracker()
function run(action){
    try{
        action()
    }
    catch(err){
        if(err instanceof DuplicateId||err instanceof InvalideAmount||err instanceof IdNotFound){
            console.log(err.message);
        }
        else{
            throw err
        }
    }
}

//-------add income--------
run(()=>{myExpenses.addIncome("I-01",5000,"2026-07-01");console.log(`Income added`)})
run(()=>{myExpenses.addIncome("I-02",3000,"2026-08-05");console.log(`Income added`)})
run(()=>{myExpenses.addIncome("I-02",3000,"2026-08-05");console.log(`Income added`)})
//-------add expenses-------
run(()=>{myExpenses.addExpense("E-01",1200,"2026-07-10");console.log(`Expense added`)})
run(()=>{myExpenses.addExpense("E-02",800,"2026-08-20");console.log(`Expense added`)})
run(()=>{myExpenses.addExpense("E-03",-800,"2026-08-20");console.log(`Expense added`)})

run(()=>{console.log(`Income:`,myExpenses.totalIncome())})
run(()=>{console.log(`Expense:`,myExpenses.totalExpense())})
run(()=>{console.log(`Balance:`,myExpenses.balance())})



run(()=>{const result = myExpenses.list()
    console.table(result)
    console.log(result.length)
})

run(()=>{for(let [keys,{income,expense,net}] of (myExpenses.monthlySummary())){
    console.log(`Report of ${keys} is income: ${income}, expense: ${expense}, net: ${net}`)
}})

run(()=>{myExpenses.remove("E-01");console.log("removed")})
run(()=>{const result = myExpenses.list()
    console.table(result)
    console.log(result.length)
})