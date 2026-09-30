// import {Items,app,myItem,Config,myConfig} from "./express_task2"
import "dotenv/config"
import express from "express"
import { RequestHandler,Request,Response } from "express"

const requireEnv = (param: string) => {
    const value = process.env[param];
    if (!value) {
        throw new Error(`Missing env variable of ${param}`);
    }
    return value;
}

const API_KEY = requireEnv("API_KEY")

export const app = express()
app.use(express.json())

export interface Items{
    id: string,
    name: string
}
app.use(express.json())
class ValidationError extends Error{

    constructor(message: string){
        super(message),
        this.name = "ValidationError"
    }
}

class ItemRepository{
    #data : Map<string,Items> = new Map()

    create(items:Items):Items{
        const myItem = items
        this.#data.set(items.id,items)
        return items;
    }

    list(){
        return [...this.#data.values()]
    }
}


class ItemService{

    constructor(private readonly repo: ItemRepository){}

    createItem(name: string):Items{

        if(!name){
            throw new ValidationError("name is required")
        }
        return this.repo.create({id: crypto.randomUUID(),name})
    }

    getItems(){
        return [...this.repo.list()]
    }

    checkApi(apiKey:string){

        if(!apiKey){
            throw new ValidationError("missing api key")
        }
        if(apiKey!= API_KEY){
            throw new ValidationError("wrong secret")
        }
        return {message: "sucess"}
    }
}

const itemRep = new ItemRepository()
const itemService = new ItemService(itemRep)
app.post("/items",(req: Request,res: Response)=>{
    try{
        const item:Items = itemService.createItem(req.body.name)
        return res.status(201).json(item)
    }
    catch(error){
        return res.status(400).json({error})
    }
})

app.get("/items",(req: Request,res: Response)=>{

    try{
        const apiKey = req.headers["x-api-key"]


        if (typeof apiKey !== "string") {
            return res.status(401).json({
                error: "missing api key"
            })
        }

        itemService.checkApi(apiKey)

        const items = itemService.getItems()
        res.status(200).json(items)
    }
    catch(error){
        if(error instanceof ValidationError){
            if(error.message === "missing api key"){
                return res.status(401).json({error})
            }
            if(error.message === "wrong secret"){
                return res.status(403).json({error})
            }
        }
        return res.status(500).json({message: "Internal server error"})
        
    }

})

// app.listen(4000,async()=>{

//     console.log("Ports listening at 4000")

//     // const res1 = await fetch("http://localhost:4000/items",{
//     //     method : "POST",
//     //     headers: {"Content-Type":"application/json"},
//     //     body : JSON.stringify({name: "kishore"})
//     // })
//     // console.log(res1.status)
//     // console.log(await res1.json())

//     // const res2 = await fetch("http://localhost:4000/items",{
//     //     method : "POST",
//     //     headers: {"Content-Type":"application/json"},
//     //     body : JSON.stringify({name: "kishore"})
//     // })
//     // console.log(res2.status)
//     // console.log(await res2.json())

//     // const res3 = await fetch("http://localhost:4000/items",{
//     // })
//     // console.log(res3.status)
//     // console.log(await res3.json())
// })
