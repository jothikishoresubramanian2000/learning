console.log("1")

const promise = Promise.resolve().then(print=>{console.log("3")})
const sT = setTimeout(()=>{console.log("2")},0)
console.log("4")


