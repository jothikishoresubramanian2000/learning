const getPr =(id) =>{
    return new Promise((resolve, reject) =>{
        setTimeout(() =>{
            if (id === "PR-001")
                resolve({id, amount: 5000})
            else
                reject("Pr not found")
        },5000)
    })
}

const prList = ["PR-001","PR-002"]

for(const prs of prList){
    getPr(prs)
.then(pr => console.log(`Found: ${pr.amount}`))
.catch(err => console.log(`Error: ${err}`))
}
