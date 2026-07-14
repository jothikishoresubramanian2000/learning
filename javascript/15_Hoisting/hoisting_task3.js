console.log(supplier); //silent bug, because this is undefined, dangerous because this is not strict as let/const
console.log(prId());
console.log(prId2());

var supplier = "Cisco"

function prId(){
    return "PR-001"
}

const prId2 =()=>{
    return "PR-001"
}