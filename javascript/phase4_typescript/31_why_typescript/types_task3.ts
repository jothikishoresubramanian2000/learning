const addGst=(price: number):number=>{

    return price + price * 0.18
}

console.log(addGst('hi'))// refused to compile