import{User} from "./model_task1"
import { isValidRole } from "./model_task2"
import { ValidationError } from "./validate_task1"
import { tenants,orgs,users } from "./store_task2"
import { run } from "./validate_task1"

const parseUserInput = (raw:unknown): User =>{

    const data = raw as Partial<User>

    if(typeof data != "object" || data === null){
        throw new ValidationError("Invalid input")
    }
    if(typeof data.id != "string" || !data.id){
        throw new ValidationError("id required")
    }
    if(typeof data.name != "string" || !data.name){
        throw new ValidationError("Name required")
    }

    if(typeof data.orgId != "string" || !data.orgId){
        throw new ValidationError("Org required")
    }
    if(!data.role || !isValidRole(data.role)){
        throw new ValidationError("Invalid role")
    }

    return {id: data.id, orgId: data.orgId,name: data.name, role: data.role}

}

tenants.create({ id: "T-01", name: "Acme" });
orgs.create({ id: "O-01", tenantId: "T-01", name: "Engineering" });

const goodInput: unknown = { id: "U-01", orgId: "O-01", name: "Kishore", role: "admin" };
console.log(users.create(parseUserInput(goodInput)));

const badInput: unknown = { id: "U-02", orgId: "O-01", name: "Ghost", role: "superuser" };
try { users.create(parseUserInput(badInput)); } catch (e) { console.log((e as Error).name); }
