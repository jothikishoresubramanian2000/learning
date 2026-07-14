console.log(c)
console.log(a)
console.log(b)

var c =10; //  allocated memory and have placeholder undefined - global memory allocation
let a = 10; // reference error, allocated memory and not initialized - this and const are in script memory location instead of global, so this is in TDZ
const b =10; //reference error, allocated memory and not initialized
