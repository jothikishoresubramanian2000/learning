const dept = {
    name: "IT",
    prs: ["PR-001", "PR-002"],
    listprs(){
        let x =()=>{
            this.prs.forEach(pr => {
                console.log(`${this.name} ${pr}`)
            });
        }
        x();
    }
}

dept.listprs()

function printDept(){
    console.log(this.name)
}

let it = {
    name: "IT"
}
let hr = {
    name: "HR"
}

printDept.call(it)
printDept.call(hr)