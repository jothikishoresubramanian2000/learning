
const toEntry=<T,K>(key: T,val:K):{key:T,value:K}=>{

    return {key: key,value: val}
}

console.log((toEntry("role", "admin")).value.toLocaleUpperCase())
console.log((toEntry("age", 24)).value.toFixed(1))