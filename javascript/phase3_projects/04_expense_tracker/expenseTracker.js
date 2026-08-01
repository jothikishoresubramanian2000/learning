class DuplicateId extends Error{
    constructor(message){
        super(message)
        this.name = "DuplicateId"
    }
}

class InvalideAmount extends Error{
    constructor(message){
        super(message)
        this.name = "InvalidAmount"
    }
}

class IdNotFound extends Error{
    constructor(message){
        super(message)
        this.name ="IdNotFound"
    }
}

class ExpenseTracker{

    #transaction = new Map()

    addIncome(id,amount,date){
        if(!this.#transaction.has(id)){
            if(amount <=0){
                throw new InvalideAmount("Amount must be positive")
            }
            this.#transaction.set(id,{id,amount,date, type: "income"})
        }
        else throw new DuplicateId(`id already exists`)
    }

    addExpense(id,amount,date){
        if(!this.#transaction.has(id)){
            if(amount <=0){
                throw new InvalideAmount("Amount must be positive")
            }
            this.#transaction.set(id,{id,amount,date, type: "expense"})
        }
        else throw new DuplicateId(`id already exists`)
    }

    remove(id){
        if(this.#transaction.has(id)){
            this.#transaction.delete(id)
        }
        else{
            throw new IdNotFound("id not found")
        }
    }

    list(){
        return[...this.#transaction.values()]
    }

    balance(){
        return this.totalIncome()-this.totalExpense()
        
    }

    totalIncome(){
        return [...this.#transaction.values()]
        .filter(inc => inc.type ==="income")
        .reduce((sum,crr)=> sum+crr.amount,0)
    }

    totalExpense(){
        return [...this.list().values()]
        .filter(inc => inc.type ==="expense")
        .reduce((sum,crr)=> sum+crr.amount,0)
    }

monthlySummary() {
    const monthlyReport = new Map();

    for (const reps of this.list()) {
        const key = reps.date.slice(0, 7)

        if (!monthlyReport.has(key)) {
            monthlyReport.set(key, {
                income: 0,
                expense: 0
            });
        }

        const report = monthlyReport.get(key);

        if (reps.type === "income") {
            report.income += reps.amount;
        } else {
            report.expense += reps.amount;
        }

        report.net = report.income - report.expense
    }

    return[...( monthlyReport)];
}

}

module.exports = {InvalideAmount,DuplicateId,ExpenseTracker,IdNotFound}