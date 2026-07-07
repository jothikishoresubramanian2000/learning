const stock = 0;

//consider 0 as empty
console.log(stock||100)

//consider 0 as value
console.log(stock??100)

const user = { name: "jk" };

console.log(user?.address?.city)