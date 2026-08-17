class BankAccount{

    constructor(
        public readonly accountId: string,
        public owner: string,
        private balance: number
    
    ){}

    deposite(amount: number){
        this.balance += amount
        return this.balance
    }

    getBalance(){
        return this.balance
    }
}

const acc = new BankAccount("AC-01","Kishore",1000);
console.log(acc.deposite(500))
console.log(acc.getBalance())
console.log(acc.owner)
//acc.balance Property 'balance' is private and only accessible within class 'BankAccount'.
//acc.accountId = "X" Cannot assign to 'accountId' because it is a read-only property.

