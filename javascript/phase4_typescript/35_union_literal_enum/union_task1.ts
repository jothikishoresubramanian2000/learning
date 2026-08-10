const format = (id: string| number):string=>{

    if(typeof id === "string"){
        return id.toUpperCase()
    }
    return id.toFixed(2)
}

console.log(format("pr-001"))
console.log(format(59))