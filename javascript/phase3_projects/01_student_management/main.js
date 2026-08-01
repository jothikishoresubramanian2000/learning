const {DuplicateEntry,StudentManager,IdNotFound, MarkNotFound} = require("./studentManager")



const addStudents = (student)=>{
    try{
        students.addStudent(student)
        console.log(`Student added`)
        
    }
    catch(err){
        if(err instanceof DuplicateEntry){
            console.log(err.message)
        }
        else{
            throw err
        }
    }
}
const students = new StudentManager


const findById = (id)=>{
    try{
        const result = students.find(id)
        console.table(result)

    }
    catch(err){
        if(err instanceof IdNotFound){
            console.log(err.message)
        }
        else{
            throw err
        }
    }
}

const updateStudent = (id,mark)=>{
    try{
        students.update(id,mark)
        console.log(`Mark updated`)
    }
    catch(err){
        if(err instanceof IdNotFound){
            console.log(err.message)
        }
        else{
            throw err
        }
    }
}


const removeStudent = (id)=>{
    try{
        students.remove(id)
        console.log(`Student removed`)
    }
    catch(err){
        if(err instanceof IdNotFound){
            console.log(err.message)
        }
        else{
            throw err
        }
    }
}

const getStudent = ()=>{
    const studentList = students.list()
    for (const [key, { id, name, mark }] of studentList) {
        console.log(`${key}: ${id}, ${name}, ${mark}`);
    }
}


addStudents({id: "SU-001",name: "JK", mark:90})
addStudents({id: "SU-001",name: "JK", mark:90})
addStudents({id: "SU-002",name: "SK", mark:30})
findById("SU-002")
findById("SU-003")
updateStudent("SU-002",69)
getStudent()
removeStudent("SU-002")
getStudent()




