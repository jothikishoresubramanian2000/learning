function dprice(amount){
    return amount + (amount/100 * 18)
}

const eprice = function(amount){
    return amount + (amount/100 * 18)
}

const aprice = amount => ((amount/100) * 18)

console.log(dprice(1000))
console.log(eprice(1000))
console.log(aprice(1000))