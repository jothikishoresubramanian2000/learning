const validate=(pr)=>{
    return new Promise((resolve, reject) =>{
        if(pr.id == null|| pr.amount <=0){
            reject(`Invalid`)
        }  
        else{
            resolve(pr)
        }
            
    })
}

const checkBudget =(pr)=>{
    return new Promise((resolve, reject) =>{
        if(pr.amount >10000){
            reject(`over budget`);
        }
        else{
            resolve(pr);
        }
    })
}

const raisePo = (pr)=>{
    return new Promise((resolve)=>{
        setTimeout(() => {
            resolve(`PO-${pr.id} raised`);
        }, 1000);
        
    })
}

const getApprovers=(dept)=>{
    return new Promise((resolve) =>{
        resolve([`Kishore`,`Jk`])
    })
}

const getBudget =(dept)=>{
    return new Promise((resolve) =>{
        resolve(50000)
    })
}

const prList ={id:"PR-001",dept: "IT", amount: 6000 }

validate(prList)
  .then(pr => checkBudget(pr))              // returns pr
  .then(pr =>
    Promise.all([getApprovers(pr.dept), getBudget(pr.dept)])
      .then(([approvers, budget]) => ({ pr, approvers, budget }))  // bundle ALL together
  )
  .then(data => 
    raisePo(data.pr).then(po => ({ ...data, po }))  // add po to the bundle
  )
  .then(data => 
    console.log(`${data.po} | approvers: ${data.approvers.length} | budget: ${data.budget}`)
  )
  .catch(err => console.log("Flow failed:", err));
