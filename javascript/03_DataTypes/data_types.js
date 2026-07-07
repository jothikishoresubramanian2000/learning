let amount = 500;
let supplier = null;
let isActive = true;
let department = 'IT'

const employee ={
    name : 'kishore',
    salary : 10000,
    department : 'IT',
    isActive : true
}

console.log(employee.name)
console.log(employee.salary)
console.log(typeof amount);      // number
console.log(typeof department);  // string
console.log(typeof isActive);    // boolean
console.log(typeof supplier);    // object  ← the quirk
