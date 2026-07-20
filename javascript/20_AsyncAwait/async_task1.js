const getPr = (pr)=>{
    if(pr.id === "PR-001"){
        pr.amount = 5000
        return pr
    }
    else{
        throw `Error: not found`
    }
}

async function flow(pr){
    try{
        const prStatus = await getPr(pr)
        console.log(`Amount: ${pr.amount}`)
    }
    catch(err){
        console.log(err)
    }
    
}
const pr1 = {id:"PR-999"}
const pr2 = {id:"PR-001"}

flow(pr1)
flow(pr2)

