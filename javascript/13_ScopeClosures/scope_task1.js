const myName = "JK";

const outerFun =() =>{

    const outerVar = "Outer data";

    const innerfun = ()=>{
        const innerVar = "Inside data";
        console.log(myName,outerVar,innerVar)
    }
    
    innerfun();
    console.log(innerVar) // ref error as innerVar is scope closed
}

outerFun();