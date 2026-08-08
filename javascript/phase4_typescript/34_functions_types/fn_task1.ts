const makeGst = (price: number):number =>{

    return price + price * 0.18;
}

const greet = (name: string, greets:string= "Hi"): string =>{

    return `${greets} ${name}`
}

console.log(greet('Kishore'))
console.log(greet('Kishore','Hello'))

//makeGst('Hi')//Argument of type 'string' is not assignable to parameter of type 'number'.