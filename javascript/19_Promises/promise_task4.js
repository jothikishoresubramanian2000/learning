
const checkBudget = (pr) =>{
    return new Promise((resolve, reject) =>{
        if(pr.amount > 10000){
            reject(`failed - over budget`)
        } else{
            pr.status = "ok"
            resolve(pr)
        }
    })
}

const reserveFunds =(pr)=>{
    return new Promise((resolve) =>{
        pr.reserved = true
        resolve(pr)
    })
} 

const raisePo=(pr) =>{
    return new Promise((resolve) =>{
        resolve(`PO raise for ${pr.id}`)
    })
}
const pr = [
    {id: "PR-001",amount: 6000},
    {id: "PR-002", amount: 15000},
    {id: "PR-002", amount: 5000}
]


Promise.all(pr.map(prs => checkBudget(prs)))
    .then(prs => Promise.all(prs.map(pr => reserveFunds(pr))))
    .then(prs => Promise.all(prs.map(pr => raisePo(pr))))
    .then(results => console.log(results))
    .catch(err => console.log(`Flow failed: ${err}`));


Promise.allSettled(pr.map(prs => checkBudget(prs)))
    .then(results => {
        results.forEach(result => {
            if (result.status === "fulfilled") {
                console.log(result.value.status);
            } else {
                console.log(result.reason);
            }
        });
    });