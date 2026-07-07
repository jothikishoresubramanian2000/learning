const greet = (name = "Guest") =>{
    console.log("Hi " + name)
}

const add = (...num) =>{
    let total = 0
    for(const nums of num){
        total += nums
    }
    return total
}

greet("JK")
greet()
console.log(add(1,2,3))