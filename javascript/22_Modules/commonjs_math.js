const add = (a,b)=>{
    return a+b;
}

const gst = (amount)=>{
    return amount + (amount * 0.18);
}

module.exports = {add,gst};