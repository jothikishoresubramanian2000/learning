
class NotFoundException extends Error{
    constructor(message){
        super(message)
        this.name = "NotFoundException"
    }
}

const getPr=(pr)=>{
    if(pr!="PR-001"){
        throw new NotFoundException("not found")
    }
    else{
        return "success"
    }
}
async function processPr(pr){
    try{
        const check = await getPr(pr)
        console.log(check);
        
    }
    catch(err){
        if (err instanceof NotFoundException){
            console.log(`Failed: ${err.message}`)
        }
        else{
            throw err;
        }
        
    }
}
processPr("PR-002")