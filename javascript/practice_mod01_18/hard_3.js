
const pr = [{ id: "PR-001", amount: 20000 },{ id: "PR-002", amount: 8000 }];
const process = (pr,callback)=>{
    console.log("Processing");

    setTimeout(()=>{
        error = (pr.amount > 15000) ? true: false
        callback(error, pr.id)
    },1000)
    
}

for (let prs of pr){
    process(prs,(err,data)=>{
    if(err)
        return console.log(`Rejected ${data}: over limit`);
    console.log(`Approved ${data}`);
})
}


