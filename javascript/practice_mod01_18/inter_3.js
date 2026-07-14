const numberProducer = (lable) =>{
    let count = 0;
    return function(){
        count ++;
        console.log(`${lable}-INV-${(String(count)).padStart(3,"0")}`);}
    
}

let fy24 = numberProducer("FY24")
let fy25 = numberProducer("FY25")

fy24();
fy24();
fy25();