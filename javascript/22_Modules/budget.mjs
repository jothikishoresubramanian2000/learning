export class Budget{
    constructor(balance){
        this.balance = balance
    }

    spend(amount){
        if(this.balance <=0 && this.balance<amount){
            return "Insufficient balance"
        }
        return this.balance -= amount
    }
}

export const cbudget=(balance)=>{
    
        return {
            spend(amount){
                balance = balance - amount
                return balance
            }
        }
}
