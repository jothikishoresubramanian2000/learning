class DuplicateId extends Error{
    constructor(message){
        super(message)
        this.name = "DuplicateId"
    }
}


class BookStateErrors extends Error{
    constructor(message){
        super(message)
        this.name="BookStateErrors"
    }
}

class LibraryManager{

    #booksInventory = new Map()

    notfound(id){
        throw new BookStateErrors("book not found")
    }

    addBook(id,title){
        if(this.#booksInventory.has(id)){
            throw new DuplicateId("duplicate id")
        }
        else{
            this.#booksInventory.set(id,{id,title,issuedTo:null,dueDate:null})
        }
    }
    

    issue(id,member,dueDate){

        if(this.#booksInventory.has(id)){
            if(this.#booksInventory.get(id).issuedTo !=null){
                throw new BookStateErrors("book already issued")
            }
            this.#booksInventory.get(id).issuedTo = member
            this.#booksInventory.get(id).dueDate = dueDate
        }
        else this.notfound(id)
    }

    return(id,returnDate){
        const book = this.#booksInventory.get(id)
        if(this.#booksInventory.has(id)){
            if(this.#booksInventory.get(id).issuedTo ===null){
                throw new BookStateErrors("book not issued")
            }
            
            const diffMs= new Date(returnDate)- new Date(this.#booksInventory.get(id).dueDate) 
            const overDueDays = diffMs/(1000*60*60*24)
            
            book.issuedTo = null;
            book.dueDate = null;
            return overDueDays > 0 ? overDueDays * 10 : 0;

        }
        else this.notfound(id)
    }

    find(id){
        if(this.#booksInventory.has(id)){
            return this.#booksInventory.get(id)
        }
        else this.notfound(id)
    }

    available(){
        return ( [...this.#booksInventory.values()].filter(bk => bk.issuedTo === null))
    }
    issued(){
        return ( [...this.#booksInventory.values()].filter(bk => bk.issuedTo != null))
    }
    list(){
        return ([...this.#booksInventory.values()])
    }
}

module.exports ={DuplicateId,BookStateErrors,LibraryManager}