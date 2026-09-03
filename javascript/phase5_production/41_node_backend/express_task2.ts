import express from "express"
import { RequestHandler,Request,Response } from "express"

const app = express()
app.use(express.json())

interface Items{
    id: string,
    name: string
}
const myItem:Items[] = []
let itemCount = 0

interface Config{
    value: string
}

let myConfig: Config ={value:""}

app.post("/items",(req:Request,res:Response)=>{

    if(!req.body.name){
        return res.status(400).json({error: "Missing name"})
    }
    const itemCode = `ID-${++itemCount}`
    const item: Items = {id:itemCode,name: req.body.name}
    
    myItem.push(item)
    return res.status(201).json(item)
})


app.get("/items",(req:Request,res: Response)=>{

    return res.status(200).json(myItem)
})

app.put("/config",(req: Request,res: Response)=>{

    const myCon : Config= req.body
    myConfig.value = myCon.value
    return res.status(200).json(myConfig)
})

app.get("/config",(req:Request, res: Response)=>{

    return res.status(200).json(myConfig)
})

app.listen(4000, async() => {
    console.log("Server listening on port 4000");

    const res1 = await fetch("http://localhost:4000/items",{
        method : "POST",
        headers: {"Content-Type":"application/json"},
        body : JSON.stringify({name: "kishore"})
    })
    console.log(res1.status)
    console.log(await res1.json())
    const res2 = await fetch("http://localhost:4000/items",{
        method : "POST",
        headers: {"Content-Type":"application/json"},
        body : JSON.stringify({name: "kishore"})
    })
    console.log(res2.status)
    console.log(await res2.json())

    const gFetch = await fetch("http://localhost:4000/items")
    console.log(gFetch.status)
    console.log(await gFetch.json())

    const cres1 = await fetch("http://localhost:4000/config",{
        method : "PUT",
        headers: {"Content-Type":"application/json"},
        body : JSON.stringify({value: "X"})
    })
    console.log(cres1.status)
    console.log(await cres1.json())
    const cres2 = await fetch("http://localhost:4000/config",{
        method : "PUT",
        headers: {"Content-Type":"application/json"},
        body : JSON.stringify({value: "X"})
    })
    console.log(cres2.status)
    console.log(await cres2.json())

    const cgFetch = await fetch("http://localhost:4000/config")
    console.log(cgFetch.status)
    console.log(await cgFetch.json())

});