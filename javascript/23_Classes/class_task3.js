class Budget{
    #balance
    static counter =0;
    constructor(balance){
        this.#balance = balance
        Budget.counter++
    }

    spend(amt) {
        if (this.#balance - amt < 0) throw new Error("insufficient");
            this.#balance -= amt;
        return this.#balance;
    }
    get left(){
        return this.#balance
    }
}

const b = new Budget(10000);
console.log(b.spend(3000));   
console.log(b.spend(5000));   
console.log(b.left);          
const b2 = new Budget(5000);
console.log(Budget.counter);    