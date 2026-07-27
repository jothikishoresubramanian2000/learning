const {InvalidPrError,PrService} = require("./prService")


const myPrs = new PrService()

function run(pr){
    try{

        myPrs.add(pr)
    }
    catch(err){
        if(err instanceof InvalidPrError){
            console.log(`Rejected ${pr.id}: ${err.message}`)
        }
        else{
            throw err
        }
    }
    
}

run({id:"PR-001",dept:"IT",amount:5000})
run({id:"PR-002",dept:"HR",amount:2000})
run({id:"PR-003",dept:"IT",amount:12000})
run({id:"PR-001",dept:"FIN",amount:4000})
run({id:"PR-004",dept:"FIN",amount:0})
run({id:"PR-005",dept:"IT",amount:8000})

console.log(`--- report ---`)
console.log(myPrs.count)
console.log(myPrs.departments())
const dtotals = myPrs.totalsByDept()


for(let [keys,value] of dtotals){
    console.log(`${keys}: ${value}`)
}
console.log(myPrs.highValue(6000))