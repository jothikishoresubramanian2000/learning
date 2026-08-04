class DuplicateId extends Error{
    constructor(message){
        super(message)
        this.name = "DuplicateId"
    }
}

class NotFound extends Error{
    constructor(message){
        super(message)
        this.name = "NotFound"
    }
}

class TenantManagement{

    #tenantData = new Map();

    createTenant(id,name){

        if(this.#tenantData.has(id)){
            throw new DuplicateId("id already exists")
        }
        else{
            const tenant = {id,name}
            this.#tenantData.set(id,tenant)
            return tenant                        // return the created tenant, not the Map
        }
    }

    getTenant(id){

        if(this.#tenantData.has(id)){
            return this.#tenantData.get(id)
        }
        else{
            throw new NotFound("tenant not found")
        }
    }

    listTenants(){
        return [...this.#tenantData.values()]
    }
}


module.exports = {DuplicateId,NotFound,TenantManagement}