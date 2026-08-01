const {DuplicateId,IdNotFound,InventoryManager,InvalidQuantity} =require("./inventoryManager")

const inventory = new InventoryManager

function run(action){

    try{
        action()
    }
    catch(err){
        if(err instanceof DuplicateId || err instanceof IdNotFound|| err instanceof InvalidQuantity){
            console.log(err.message)
        }
        else throw err
    }
}

//-------add-----------
run(()=>{inventory.addProduct({id:"P-01",name:"Pen",price:10,stock:100});console.log(`Product added`)})
run(()=>{inventory.addProduct({id:"P-02",name:"Laptop",price:50000,stock:5});console.log(`Product added`)})
run(()=>{inventory.addProduct({id:"P-03",name:"Mouse",price:500,stock:3});console.log(`Product added`)})
run(()=>{inventory.addProduct({id:"P-01",name:"Pen",price:10,stock:100});console.log(`Product added`)})

//--------restock-------
run(()=>{inventory.restock("P-03",10);console.log(`Restocked`)})

//--------sell----------
run(()=>{inventory.sell("P-01",30);console.log(`Product selled`)})
run(()=>{inventory.sell("P-02",10);console.log(`Product selled`)})
run(()=>{inventory.sell("P-03",0);console.log(`Product selled`)})

//---------pricegst-----------

run(()=>{console.log(`Gst amount: ${inventory.priceWithGst("P-02")}`)})
run(()=>{console.table(inventory.lowStock(20))})
run(()=>{console.table(inventory.list());console.log(inventory.list().length)})
run(()=>{console.log(inventory.totalInventoryValue())})

run(()=>{inventory.find("P-99")})