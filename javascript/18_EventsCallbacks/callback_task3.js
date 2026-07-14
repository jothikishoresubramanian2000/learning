const pr = "PR-001";

const notify =(pr,callback) =>{
    callback(pr)
}
const approve =(pr,callback)=>{
    callback(pr)
    notify(pr,pr => console.log(`notified ${pr}`))
}
const submit = (pr,callback)=>{
    callback(pr)
    approve(pr,pr => console.log(`Approved ${pr}`))
}

submit(pr,pr => console.log(`Submitted ${pr}`))

//each needs to call other so it grows too much nested and promise will fix this