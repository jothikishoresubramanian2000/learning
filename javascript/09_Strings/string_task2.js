let firstName = "Kishore"; let id = "1"; 

firstName = firstName.toUpperCase()
id = id.padStart(3, 0)

const employeeId = `EMP-${firstName}-${id}`

console.log(employeeId)
console.log(employeeId.startsWith("EMP"))