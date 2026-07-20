export const makePrId =(n)=>{
    console.log(`PR-${String(n).padStart(3,"0")}`)
}

export const gstAmt = (amount)=>{
    console.log(amount + (amount * 0.18))
}