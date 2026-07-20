import Prserv from "./approvals.mjs"
import {DuplicateApprovalError} from "./approvals.mjs"

const prService = new Prserv

async function flow(){
    try{
        prService.record("Kishore", "PR-001")
        prService.record("JK", "PR-002")
        prService.record("Kishore", "PR-003")
        prService.record("Kishore", "PR-001")
    }
    catch(err){
        if(err instanceof DuplicateApprovalError){
            console.log(err.message)
        }
        else{
            throw err
        }
    }
}
flow()
const prInfo = prService.counts()

console.log(prInfo)
for(let [key,value] of prInfo){
    console.log(`${key}: ${value}`)
}
console.log("Total: ",prService.total())