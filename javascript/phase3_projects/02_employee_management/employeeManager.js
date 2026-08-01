class DuplicateId extends Error{
    constructor(message){
        super(message),
        this.name = "DuplicateId"
    }
}
class IdNotFound extends Error{
    constructor(message){
        super(message),
        this.name = "IdNotFound"
    }
}


class EmployeeManager{
    
    #employee = new Map()

    add(emp){
        if(this.#employee.has(emp.id)){
            throw new DuplicateId("duplicate id")
        }
        else{
            this.#employee.set(emp.id,emp)
        }
    }

    find(id){
        if(!this.#employee.has(id)){
            throw new IdNotFound("not found")
        }
        else{
            
            return this.#employee.get(id)
        }
    }

    updateSalary(id,newSalary){
        if(!this.#employee.has(id)){
            throw new IdNotFound("not found")
        }
        else{
            this.#employee.get(id).salary = newSalary
            return this.#employee.get(id)
        }
    }

    remove(id){
        if(!this.#employee.has(id)){
            throw new IdNotFound("not found")
        }
        else{
            return this.#employee.delete(id)
        }
    }

    list(){
        return[...this.#employee.values()]
    }

    byDept(department){
        return (this.list().filter((employee => employee.dept == department)))
    }

    sortBySalary(order) {
    return this.list().sort((a, b) =>
        order === "desc" ? b.salary - a.salary : a.salary - b.salary);
    }
    depTotal(){
        let depttotals = new Map()
        for(let [key,values] of this.#employee){
            depttotals.set(values.dept,(depttotals.get(values.dept)||0)+values.salary)
        }
        
        return depttotals
    }
    averageSalary(dept){
        let avgSalary = [...(this.#employee.values())].filter(emp => emp.dept === dept)
        const length = avgSalary.length
        if (length === 0)
            return 0

        const average = avgSalary.reduce((sum,crr) => sum + crr.salary,0)
        return average/length
        
        
    }
}
module.exports = {EmployeeManager,IdNotFound,DuplicateId}