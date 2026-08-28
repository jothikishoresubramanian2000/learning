export class DuplicateIdError extends Error{
    constructor(message: string){
        super(message);
        this.name = "DuplicateIdError"
    }
}

export class NotFoundError extends Error{
    constructor(message: string){
        super(message);
        this.name = "NotFoundError"
    }
}
export abstract class Store<T extends {id: string}>{

    protected data: Map<string,T> = new Map()
    
    create(item: T):T{
        if (this.data.has(item.id)){
            throw new DuplicateIdError("Id already exists")
        }
        else{
            this.data.set(item.id,item)
            return item
        }
    }

    getById(id: string):T{
        if(!this.data.has(id)){
            throw new NotFoundError("id not found")
        }
        return this.data.get(id)!
    }

    list():T[]{
        return [...this.data.values()]
    }

    update(id: string, patch: Partial<T>): T {
        const existing = this.getById(id);

        const { id: _, ...updates } = patch;

        const updated = {
            ...existing,
            ...updates
        };

        this.data.set(id, updated);

        return updated;
    }

    delete(id:string){
        if(!this.data.has(id)){
            throw new NotFoundError("id not found")
        }
        else
            return this.data.delete(id)
    }
}

// class TestStore extends Store<{ id: string; label: string }> {}
// const s = new TestStore();
// s.create({ id: "X-01", label: "first" });
// console.log(s.getById("X-01"));
// console.table(s.list());

// const run = (action:() => void)=> {
//     try{
//         action()
//     }
//     catch(err){
//         if(err instanceof NotFoundError|| err instanceof DuplicateIdError){
//             console.log(err.name)
//         }
//         else{
//             throw err
//         }
//     }
// }

// run(()=>{s.create({ id: "X-01", label: "dup" });})
// run(()=>{s.getById("X-099")})
