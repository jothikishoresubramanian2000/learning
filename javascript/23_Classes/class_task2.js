class Document{
    constructor(id){
        this.id = id
    }
    describe(){
        return `Document: ${this.id}`
    }
}

class PurchaseOrder extends Document{
    constructor(id,vendor){
        super(id),
        this.vendor = vendor
    }
    describe(){
        return`PO ${this.id} for ${this.vendor}`
    }
}

const pr = new PurchaseOrder("D-01","Cisco")
console.log(pr.describe())