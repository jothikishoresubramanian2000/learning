const addGst=(price: number):number=>{

    return price + price * 0.18
}

console.log(addGst(5000));
//console.log(addGst('string')); observed the error