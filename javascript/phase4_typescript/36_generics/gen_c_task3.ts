interface HasId{
    id: string
}


class Store<T extends HasId>{

    private myItems = new Map<string,T>

    add(item:T):T{

        this.myItems.set(item.id,item)
        return item
    }

    get(id:string):T|undefined{

        return this.myItems.get(id)
    }

    all():T[]{

        return [...this.myItems.values()]
    }
}

type User = {id: string,name:string}
type Books = {id: string,title: string}

const myUsers = new Store<User>();
const myBooks = new Store<Books>();

myUsers.add({id:"U-001",name:"Kishore"})
myUsers.add({id:"U-002",name:"Jk"})
myBooks.add({id:"B-001",title: "what is js"})

console.log(myUsers.all())

// interface HasId<>{
//     id: string
// }


// class Store<T extends HasId>

// the above generic is used to two types id shape, where in project 8 managers, we can do the same,
// but we need to write two seperate class to do this, if one we can manage but we lose type, let's say Users objects accidentally sends title 
// instead of name, it stores , [ { id: 'U-001', name: 'Kishore' }, { id: 'U-002', title: 'Jk' } ]
