const {IdNotFound,DuplicateId,EmployeeManager} =require("./employeeManager")

const employees = new EmployeeManager

const run=(action)=>{

    try{
        action();
    }
    catch(err){
        if(err instanceof DuplicateId || err instanceof IdNotFound){
            console.log(err.message)
        }
        else{
            throw err
        }
    }

}


run(()=>{employees.add({id: "E-01",name: "Kishore",dept:"IT",salary:50000});console.log(`Employee added`)})
run(()=>{employees.add({id: "E-02",name: "JK",dept:"HR",salary:40000});console.log(`Employee added`)})
run(()=>{employees.add({id: "E-03",name: "Ravi",dept:"IT",salary:70000});console.log(`Employee added`)})
run(()=>{employees.add({id: "E-04",name: "SK",dept:"HR",salary:45000});console.log(`Employee added`)})
run(()=>{employees.add({id: "E-01",name: "SK",dept:"HR",salary:30000});console.log(`Employee added`)})

run(()=>{console.table(employees.find("E-01"))})
run(()=>{console.table(employees.find("E-99"))})

run(()=>{employees.updateSalary("E-01",10);console.log(`Employee salary updated`)})
run(()=>{employees.remove("E-04");console.log("Employee removed")})



run(()=>{console.table(employees.byDept("IT"))})
run(()=>{console.table(employees.sortBySalary("desc"))})
run(()=>{
    for(const [keys,values] of employees.depTotal()){
        console.log(`${keys}: ${values}`)
    }
})

run(()=>{console.log(`Average salary is: ${employees.averageSalary("IT")}`)})
run(()=>{
    const result = employees.list()
    for(const emp of result){
        console.table(emp)
    }
    console.log("Total employees:",result.length);
})