let emp = { name: "Kishore", age: 24, dept: "IT" ,greet(){return `Hi ${this.name}`}};

console.log(emp.greet())

const {name, dept} = emp;
console.log(`${name} ${dept}`)

let dkey = "dept"
console.log(emp[dkey])