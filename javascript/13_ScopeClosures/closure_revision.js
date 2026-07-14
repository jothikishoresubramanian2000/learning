const poNumberer =(dept)=>{
    let number = 0;
    const label = "PO"
    return function(){
        number ++;
        return(`${dept}-${label}-${String(number).padStart(3,"0")}`)
    }
}

let hrPo = poNumberer("HR")
let itPo = poNumberer("IT")
console.log(itPo());
console.log(itPo());
console.log(hrPo());
console.log(itPo());
