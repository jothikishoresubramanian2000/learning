const EventEmitter = require("events")



class PurchaseRequestService extends EventEmitter{
    submitPr(pr){
        
        this.emit("pr-submitted",pr)
    }
}

const service = new PurchaseRequestService()

const prs =["PR-001","PR-002"]

service.on("pr-submitted",pr=>{console.log(`email-sent for ${pr}`)})
service.on("pr-submitted",pr=>{console.log(`audit logged for ${pr}`)})
service.once("pr-submitted",pr=> console.log(`first PR of the day: ${pr}`))

for (const pr of prs){
    service.submitPr(pr)
}
