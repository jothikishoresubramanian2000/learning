class InsufficientBudgetError extends Error{
    constructor(message){
        super(message)
        this.name = "InsufficientBudgetError"
    }
}

class Budget{
    #remaining
    constructor(budget){
        this.budget = budget
        this.#remaining = budget
    }

    async spend(amount) {
            
            return this.spended(amount)
            
    }

    spended(amount){
        return new Promise((resolve,reject) =>{
                setTimeout(() => {
                if (amount > this.#remaining){
                    reject(new InsufficientBudgetError("not enough budget"))
                }
                else{
                    this.#remaining -= amount
                    resolve(amount)
                }
            }, 1000);
            })
    }
    
    get left(){
        return this.#remaining
    }
}

async function run() {
    const pr1 = new Budget(10000)

    try{
        await pr1.spend(4000)
        console.log(pr1.left)
        await pr1.spend(3000)
        console.log(pr1.left)
        await pr1.spend(5000)
        console.log(pr1.left)
    }
    catch(err){
        if (err instanceof InsufficientBudgetError){
            console.log(`Blocked: ${err.message}`)
        }
    }
    
}
run()

