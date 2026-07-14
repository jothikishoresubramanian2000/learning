const pr = {
        id: "PR-001",
        amount: 10000
    }
const processPr = (pr,callback) =>{
    let gstPrAmount = pr.amount + (pr.amount * 0.18);
    callback(pr.id,gstPrAmount);
}

processPr(pr,(id,gstAmount)=>{console.log(`${id} total:${gstAmount}`);
})