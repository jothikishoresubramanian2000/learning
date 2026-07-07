let user = { name: "Kishore", address: { city: "Chennai" } }

let cuser = {...user};

cuser.role = "admin";

console.log(user)
console.log(cuser)

console.log(Object.keys(user))
console.log(Object.values(user))
console.log(user?.address?.pin ?? "N/A")