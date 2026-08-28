import {Org} from"./model_task1"
import {ValidationError,run} from "./validate_task1"

const parseOrgInput =(raw: unknown):Org =>{

    const data = raw as Partial<Org>

    if(typeof data != "object" || data === null){
        throw new ValidationError("Invalid input")
    }
    if(typeof data.id != "string" || !data.id){
        throw new ValidationError("id required")
    }
    if(typeof data.name != "string" || !data.name){
        throw new ValidationError("Name required")
    }

    if(typeof data.tenantId != "string" || !data.tenantId){
        throw new ValidationError("tenantid required")
    }
    return {id: data.id, tenantId: data.tenantId,name: data.name}

}

run(()=>{ console.log(parseOrgInput({ id: "O-01", tenantId: "T-01", name: "Engineering" }))})
run(()=>{ parseOrgInput({ id: "O-01", name: "Engineering" })})


