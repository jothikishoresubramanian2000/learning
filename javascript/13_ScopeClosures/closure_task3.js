const myAtm = (balance)=>{
    return{
        deposite(amt){return balance = amt + balance},
        withDraw(amt){return balance = amt>balance? "Insuff bal":balance - amt}
    }
}

const me = myAtm(100);
console.log(me.withDraw(50))
console.log(me.balance) //is locked inside — only the returned methods can change it.
