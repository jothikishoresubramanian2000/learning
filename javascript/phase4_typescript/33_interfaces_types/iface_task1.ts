interface Employee{
    readonly id: string
    name: string
    salary: number
    department?: string
}

const a : Employee ={
    id : "EMP-001",
    name : "JK",
    salary: 10,
}

const b: Employee={
    id : "EMP-002",
    name: "Kishore",
    salary: 20,
    department : "IT"
}

// const c: Employee ={
//     id: "EMP-003",
//     name: "Thalapathy Vetri Kondan",
// }  //Property 'salary' is missing in type '{ id: string; name: string; }' but required in type 'Employee'.//iface_task1.ts(4, 5): 'salary' is declared here.


// why it says c is decalred and it's property is never read?
//c.id = "EMP-001" it says cannot reassign for read-only property