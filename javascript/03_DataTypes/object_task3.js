user1 = {name: "Vicky", role: "admin" }

const user2 = user1;

user2.role = "guest"
//user1 role = guest

console.log(user1.role)
console.log(user2.role)