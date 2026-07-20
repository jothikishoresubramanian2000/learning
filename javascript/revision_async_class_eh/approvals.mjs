export class DuplicateApprovalError extends Error{
    constructor(message){
        super(message)
        this.name = "DuplicateApprovalError"
    }
}

export default class ApprovalService{


    prRec = new Map()
    currentCount = 0
    ApprovedPr = new Set()
    record(name, prId){
        if(this.ApprovedPr.has(prId)){
            throw new DuplicateApprovalError(`${prId} already approved`)
        }
        else{
            this.ApprovedPr.add(prId);
            if(this.prRec.has(name)){
                this.currentCount = this.prRec.get(name)
                this.prRec.set(name, this.currentCount+1)
            
            }
            else{
                this.prRec.set(name,1)
            }
        }
    }

    counts(){
        return this.prRec
    }
    total(){
        return this.ApprovedPr.size
    }
}





