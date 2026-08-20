type Inventory = Record<"pen"|"book"|"bag",number>


const myInventory: Inventory ={
    pen: 10,
    book: 20,
    bag: 5
    //laptop: 10 - Object literal may only specify known properties, and 'laptop' does not exist in type 'Inventory'.
}
console.log(myInventory.pen) 
interface Font{
    theme: string,
    fontSize: number
}
type RSerttings = Readonly<Font>

const myFont: RSerttings = {theme: "Winter", fontSize: 100}

//myFont.fontSize = 90 - Cannot assign to 'fontSize' because it is a read-only property.
console.log(myFont) 