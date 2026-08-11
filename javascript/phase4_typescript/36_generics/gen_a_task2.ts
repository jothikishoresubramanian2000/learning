const pair = <t>(item: t): t[]=>{
    const data: [t,t] = [item,item]
    return data
}

console.log(pair(5))
console.log(pair('hi'))