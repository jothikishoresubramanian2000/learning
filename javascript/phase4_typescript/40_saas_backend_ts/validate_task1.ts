import {Tenant} from "./model_task1"

export class ValidationError extends Error{

    constructor(message: string){
        super(message)
        this.name = "ValidationError"
    }
}

const parseTenantInput = (item: unknown):Tenant =>{

    const data = item as Partial<Tenant>

    if(typeof data != "object" || data === null){
        throw new ValidationError("Invalid input")
    }
    if(typeof data.id != "string" || !data.id){
        throw new ValidationError("id required")
    }
    if(typeof data.name != "string" || !data.name){
        throw new ValidationError("Name required")
    }
    return {id: data.id, name: data.name}
}

export const run = (action: ()=>void)=>{

    try{
        action()
    }
    catch(err){
        if(err instanceof ValidationError){
            console.log(err.name)
        }
        else
            throw err
    }
}


run(()=>{console.log(parseTenantInput({id:"T-01",name:"Acme"}))})
run(()=>{parseTenantInput(null)})
run(()=>{parseTenantInput("not an object")})
