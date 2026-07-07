let a = [10,20,30];

let b = a;

b.push(40);
console.log(a);

let c = [...a];

c.push(50);
console.log(a)
console.log(c)

const arr = [10,20,30];
console.log(arr.includes(20))
console.log(arr.indexOf(30))