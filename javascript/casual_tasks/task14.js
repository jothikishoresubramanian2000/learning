let str = 'Racecar'
let str2 = 'hello'

str = str.toLowerCase()

let palstr = str.split("").reverse().join("")

str2 = str2.toLowerCase()

let palstr2 = str2.split("").reverse().join("")

console.log(str === palstr)
console.log(str2 === palstr2)