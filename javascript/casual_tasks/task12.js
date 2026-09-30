const arrStr = (string) =>{

const sorted = string.sort((a,b)=> a.length - b.length)
console.log(sorted)
}


arrStr(["banana", "kiwi", "apple", "fig"])