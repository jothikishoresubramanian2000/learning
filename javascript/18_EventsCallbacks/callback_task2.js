console.log("1 submitting");

setTimeout(()=>{console.log(`2 approved (after 1s)`)},1000)
console.log("3 next task");

const validatePr = (pr, callback)=>{
    let error = pr.amount <= 0 ? true:false
    callback(error, pr.id)
}

validatePr({ id: "PR-002", amount: 0},(err,id)=>{
    if(err) 
       return console.log("Failed: invalid amount"); 
    
    console.log(`Valid: ${id}`)})
validatePr({ id: "PR-003", amount: 5000 },(err,id)=>{
    if(err) 
       return console.log("Failed: invalid amount"); 
    
    console.log(`Valid: ${id}`)})