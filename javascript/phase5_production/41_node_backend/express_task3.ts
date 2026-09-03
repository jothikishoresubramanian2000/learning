import express from "express"
import { Request,Response } from "express"

const app = express()
app.use(express.json())


app.use((req: Request, res: Response, next)=>{

    console.log(`${req.method},${req.url}`)
    next()
})

app.get("/tenants/:id",(req: Request, res: Response)=>{

    const id = req.params.id
    const thisAccept = req.headers["accept"]?.includes("application/json")

    if(thisAccept){
        return res.status(200).json({id: id,name: "kishore"})
    }
    else {
        return res.status(200)
        .type("text")
        .send(`id: ${id}, name: kishore`)
    }
})

app.listen(4000,async()=>{console.log("server listening at port 4000")

    const res1 = await fetch("http://localhost:4000/tenants/T-01",{
        headers: {"accept":"application/json"}
    })

    console.log(res1.status);
    
    console.log(await res1.json())  
    console.log(res1.headers.get("content-type"))
      

    const res2 = await fetch("http://localhost:4000/tenants/T-01",{
        headers: {"accept":"text/plain"}
    })

    console.log(res2.status);
    console.log(res2.headers.get("content-type")); 
    console.log(await res2.text())
})