class BudgetError extends Error{
    constructor(message){
        super(message)
        this.name = "Budget error"
    }
}


const amountCheck=(amount)=>{
    if(amount > 10000){
        throw new BudgetError("over budget");
    }
    return "approved"
}

const prflow =(pr)=>{
    try{
        console.log(amountCheck(pr.amount))
    }
    catch(err){
        if (err instanceof BudgetError){
            console.log(`Budget error: ${err.message}`)
        }
        else{
            throw err;
            
        }
    }
}

const pr ={amount: 6000}
const pr1 ={amount: 11000}
prflow(pr1)
prflow(pr)