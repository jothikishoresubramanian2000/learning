const pr = { id: "PR-001", dept: "IT",
               supplier: { name: "Cisco", city: "Chennai" } }

console.log(pr.supplier.city)
console.log(pr.supplier?.pin ?? "N/A");

const pr2 = {...pr, status: "Approved"}

console.log(pr2)
console.log(pr);


console.log(Object.keys(pr))

pr2.supplier.city = "Mumbai"
console.log((pr.supplier.city));


