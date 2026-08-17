interface Employee { id: string; name: string; salary: number; ssn: string }

type CreateEmployee = Omit<Employee,"id">

type UpdateEmployee = Partial<Omit<Employee,"id">>

type PublicEmployee = Omit<Employee,"ssn">

const emp1 : CreateEmployee = {name: "kishore",salary: 10,ssn:"hi"}
const updateEmp: UpdateEmployee = {name: "SK",salary: 10,ssn:"hi"}
//const updateEmp: UpdateEmployee = emp1 - this make silent entry?
const gEmp: PublicEmployee = {id: "EMP-003",name:"Jk",salary: 20}

// Object literal may only specify known properties, and 'dept' does not exist in type 'PublicEmployee'. this is the error when I try to add new feild

// if not utilities, there would be redundant interfaces

// example - interface CreateEmployee {name: string; salary: number; ssn: string }
//again for update. same, just optional, but we need to write again
//interface UpdateEmployeesss {name?: string; salary?: number; ssn?: string }
