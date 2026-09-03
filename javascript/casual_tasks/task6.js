const isPrimenumber = (num) =>{

    let count = 0
    for(let i=1;i<num;i++){

        if(num != 1 && num % i === 0){
            count++
        }
    }

    if (num === 1){
        return false
    }
    return count < 2
}

console.log(isPrimenumber(17))
console.log(isPrimenumber(18))
console.log(isPrimenumber(6))

let primeNumbers = []
let count = 0
for(let i=2;i<=100;i++){

    count = 0
    for(let j=1;j<i;j++){

        if(i%j === 0){
            count ++
        }
    }

    if(count<2){
        primeNumbers.push(i)
    }
}

console.log("prime number are:")
console.log(primeNumbers)