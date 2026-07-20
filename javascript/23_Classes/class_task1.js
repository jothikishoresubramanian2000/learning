class PurchaseRequest{
    constructor(id,amount){
        this.id = id,
        this.amount = amount
    }

    gst(){
        return this.amount + this.amount * 0.18;
    }
    summary(){
        return(`${this.id}:${this.amount}`)
    }
}

const pr1 = new PurchaseRequest("PR-001",5000)
console.log(pr1.gst())
console.log(pr1.summary())