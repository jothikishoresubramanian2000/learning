const value1 = 0
const value2 = ""
const value3 = "0"
const value4 = []
const value5 = null
const value6 = "false"

console.log(value1 ? "truthy":"falsy") //false
console.log(value2 ? "truthy":"falsy") // false
console.log(value3 ? "truthy":"falsy") //true
console.log(value4 ? "truthy":"falsy") //true
console.log(value5 ? "truthy":"falsy") // false
console.log(value6 ? "truthy":"falsy") //true
