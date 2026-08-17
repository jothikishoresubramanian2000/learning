interface Product{
    id: string,
    name: string,
    price: number,
    secret: string
}


type OptionalData=Partial<Product>
type PickData = Pick<Product,"id"|"name">
type OmitData = Omit<Product, "secret">

const updateUser: Partial<OptionalData> = {id:"P-002",name:"berowvu",price:1000,secret:"key"}
const myId: PickData = {id:"P-001",name:"Pena"}
const safe: OmitData ={id:"P-003",name:"Kunda",price:100}

console.log(updateUser);
console.log(myId);
console.log(safe);
