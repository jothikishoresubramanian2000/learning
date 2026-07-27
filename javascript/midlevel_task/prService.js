class InvalidPrError extends Error{
    constructor(message){
        super(message)
        this.name = "InvalidPrError"
    }

}

class PrService{
    #prList =[]
    #idList = new Set()
    add(pr){

        if(this.#idList.has(pr.id))
            throw new InvalidPrError(`duplicate id`)
        else if(pr.amount <=0){
            throw new InvalidPrError(`invalid amount`)
        }
        else{
            this.#prList.push(pr)
            this.#idList.add(pr.id)
        }
        
        // return the stored PR — NOT this.#prList, which would hand the caller
        // a reference to our private array (they could mutate/empty it).
        return pr
    }

    departments(){
        return [...new Set(this.#prList.map(pr => pr.dept))]
    }

    totalsByDept(){
        // LOCAL map — built fresh on every call. Using an instance field here
        // meant the same Map kept accumulating, so a 2nd call doubled the totals.
        const totals = new Map()
        for(const prdep of this.#prList){
            totals.set(prdep.dept, (totals.get(prdep.dept) || 0) + prdep.amount)
        }
        return totals
    }

    highValue(limit){
        // filter → sort by amount DESC (b - a) → then take the ids.
        // Sort must come BEFORE map, because after map we only have ids (no amount).
        return this.#prList
            .filter(pr => pr.amount > limit)
            .sort((a, b) => b.amount - a.amount)
            .map(pr => pr.id)
    }
    
    get count(){
        return this.#prList.length
    }
}

module.exports = { InvalidPrError , PrService};