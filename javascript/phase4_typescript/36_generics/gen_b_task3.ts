interface Results<T>{
    ok: boolean,
    value: T,
    message?: string
}


const uObj : Results<{id:number,name:string}> = {ok: true,value:{id:101,name:"JK"}}
const lObj : Results<number[]> = {ok: true,value:[10,20,30]}
const sObj : Results<string> = {ok: true,value:"hellojs"}

console.log(uObj)
console.log(lObj)
console.log(sObj)
//works for all above three is because<T>, it detects type in compile, so we can use for different data types, instead of writing different interface dup for each
// if not convinced by my comment, correct me