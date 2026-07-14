
const pr = {
    id:"PR-001",
    amount: 12000
}
const gstAmount = (amount) =>{
    console.log(amount + (amount*0.18))
    console.log(amount > 10000 ? true:false);
    
}
gstAmount(pr.amount)