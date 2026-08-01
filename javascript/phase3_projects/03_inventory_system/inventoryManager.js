class DuplicateId extends Error{
    constructor(message){
        super(message)
        this.name = "DuplicateId"
    }
}

class InvalidQuantity extends Error{
    constructor(message){
        super(message)
        this.name = "InvalidQuantity"
    }
}

class IdNotFound extends Error{
    constructor(message){
        super(message)
        this.name = "IdNotFound"
    }
}

class InventoryManager{
    #inventory = new Map()

    addProduct(prod){

        if(this.#inventory.has(prod.id)){
            throw new DuplicateId("id already exists")
        }

        this.#inventory.set(prod.id,prod)
    }

    find(id){
        if(this.#inventory.has(id)){
            return this.#inventory.get(id)
        }
        else throw new IdNotFound("id not found")
    }

    remove(id){
        if(this.#inventory.has(id)){
            return this.#inventory.delete(id)
        }
        else throw new IdNotFound("id not found")
    }

    list(){
        return [...this.#inventory.values()]
    }

    restock(id,qty){
        if(this.#inventory.has(id)){
            if(qty <=0){
                throw new InvalidQuantity("invalid quatity")
            }
            this.#inventory.get(id).stock += qty
        }
        else{
            throw new IdNotFound("id not found")
        }
    }
    sell(id,qty){
        if(this.#inventory.has(id)){
            if(qty <=0){
                throw new InvalidQuantity("invalid quatity")
            }
            if(qty > this.#inventory.get(id).stock){
                throw new InvalidQuantity("no overselling")
            }
            this.#inventory.get(id).stock -= qty
        }
        else{
            throw new IdNotFound("id not found")
        }
    }

    priceWithGst(id){
        if(this.#inventory.has(id)){
            return this.#inventory.get(id).price +this.#inventory.get(id).price*0.18
        }
        else{
            throw new IdNotFound("id not found")
        }
    }

    lowStock(threshold){
        return this.list().filter(prd => prd.stock < threshold)
    }

    totalInventoryValue(){
        const totalValue = this.list().reduce((sum,crr)=> sum + crr.price *crr.stock,0)
        return totalValue
    }
}


module.exports ={DuplicateId,IdNotFound,InventoryManager,InvalidQuantity}