const pr = `{
    "id":"PR-002",
    "amount":8000
}`
const bjson =`{
broken json
}`
try{
    
    console.log(JSON.parse(pr).id)
    JSON.parse(bjson)
}
catch(err){
    console.log(`Invalid JSON`)
}