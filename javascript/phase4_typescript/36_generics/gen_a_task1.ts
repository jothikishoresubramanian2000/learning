const lastOf= <item>(n: item[]): item =>{

    return n[n.length -1]!;
}

const toFix = (num: number): void =>{
    console.log(num.toFixed(2), typeof num)
}

const nresult = lastOf([10,20,30])
const sresult = lastOf(["hi","hi"]) 

//toFix(sresult) //- here it caputures = Argument of type 'string' is not assignable to parameter of type 'number'. but how?, we at compile it know the return type of the function?
toFix(nresult)