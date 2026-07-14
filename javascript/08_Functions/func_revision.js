const gstAmount =(amount) =>{
    return amount +(amount * 0.18);
}

console.log(gstAmount(10000))

const totalAmount = (...amount) =>{
    let total = 0;
    for (const amt of amount){
        total +=amt;
    }
    return total;
}

console.log(totalAmount(1200,8000,450));

const funcApprove = (pr, checkfn)=>{
    return checkfn(pr);

}

console.log(funcApprove({ amount: 24000 }, pr => pr.amount<25000))
console.log(funcApprove({ amount: 30000 }, pr => pr.amount<25000))