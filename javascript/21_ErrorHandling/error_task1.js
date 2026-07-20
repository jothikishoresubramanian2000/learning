const checkAmount =(amount)=>{
    if(amount <=0){
        throw new Error ("amount must be positive")
    }
    return amount
}

const callcheck =(amount) =>{
    try{
        checkAmount(amount)
        console.log(`Valid: ${amount}`);
        
    }
    catch(err){
        console.log(`Error: ${err.message}`)
    }
    finally{
        console.log(`validation done`)
    }
}

callcheck(-1000)
callcheck(1000)