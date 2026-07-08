const prNumberGen = () =>{
    const label = "PR-"
    let idNum = 0

    return function(){
        idNum++;
        return (label + String(idNum).padStart(3,"0"));
    }
}

const prId = prNumberGen()
console.log(prId());
console.log(prId());
console.log(prId());
const prId2 = prNumberGen()
console.log(prId2());

