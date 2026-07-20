const obj ={
    id:"PR-001",
    add(){},
    name: undefined, // undefined and funtion will be ignored in json, because those are not it's type
    amount: 2000
}

console.log(JSON.stringify(obj,null,2))