interface Address{
    city: string,
    pincode: number
}

interface Person{
    name: string,
    age: number
}

interface Manager extends Person{
    teamSize: number,
    address: Address
}

const manager: Manager ={
    name : "Jk",
    age: 25,
    teamSize: 90,
    address: {city: "coimbatore", pincode: 641062}
}
// const manager1: Manager ={
//     name : "Jk",
//     age: 25,
//     teamSize: 90,
//     address: {city: "coimbatore", pincode: "641062"}
// }

//error fr above - Type 'string' is not assignable to type 'number'.The expected type comes from property 'pincode' which is declared here on type 'Address'