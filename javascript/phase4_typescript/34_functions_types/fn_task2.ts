const total = (...amounts: number[]):number =>{

    return amounts.reduce((acc,n)=> acc + n,0)
}

const logPr =(id: string): void=>{
    console.log(`PR: ${id}`)
}


console.log(total(10,20,30))
logPr("PR-001")