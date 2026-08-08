type numMath=(price: number)=>number


const tenPercent :numMath = (price) => price * 0.9
const flat50: numMath =(price)=> price - 50

const applyDiscount = (price: number, fn: numMath): number =>{

    return fn(price)
}

console.log(applyDiscount(1000,tenPercent))
console.log(applyDiscount(1000,flat50))