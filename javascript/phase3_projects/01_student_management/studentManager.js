class DuplicateEntry extends Error{
    constructor(message){
        super(message),
        this.name = "DuplicateEntry"
    }
}

class IdNotFound extends Error{
    constructor(message){
        super(message),
        this.name = "IdNotFound"
    }
}

class StudentManager{

    #students = new Map()

    addStudent(student){
        if(this.#students.has(student.id))
            throw new DuplicateEntry("id already exists")
        else
            return this.#students.set(student.id,student)
    }
    find(id){
        if(!this.#students.has(id)){
            throw new IdNotFound("id not found")
        }
        else{
            return this.#students.get(id)
        } 
    }
    update(id,mark){
        if(!this.#students.has(id)){
            throw new IdNotFound("id not found")
        }
        else{
            return this.#students.get(id).mark = mark
        }
    }
    remove(id){
        if(!this.#students.has(id)){
            throw new IdNotFound("id not found")
        }
        else{
            return this.#students.delete(id)
        }
    }
    list(){
            return [...this.#students]
    }
    
}

module.exports={DuplicateEntry,StudentManager,IdNotFound};


