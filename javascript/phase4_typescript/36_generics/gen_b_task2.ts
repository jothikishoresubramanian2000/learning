interface Container<T>{
    data: T
}

const nContainer : Container<number> = {data: 90}
const sContainer : Container<string> = {data : "Hi"}
const arrContainer: Container<number[]> = {data: [90,90]}

console.log(nContainer.data.toFixed(2))
console.log(sContainer.data.toUpperCase())
console.log(arrContainer.data.length)