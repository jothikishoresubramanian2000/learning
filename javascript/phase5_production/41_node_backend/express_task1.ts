import express from "express"
import { RequestHandler} from "express"

const app = express()


const CheckApiKey : RequestHandler= (req,res,next) =>{

    const apiKey = req.headers['x-api-key']

    if(!apiKey){
        return res.status(401).json({error: "missing key"})
    }
    if(apiKey != "letmein"){
        return res.status(403).json({error: "wrong secret"})
    }
    next()
}
app.get("/secret",CheckApiKey,(req,res)=>{

    res.status(200).json({message: 'success'})

})


app.listen(4000,async()=>{
    console.log("server listening at port 4000")
    const res = await fetch("http://localhost:4000/secret",{
    })

    console.log(res.status)
    console.log(await res.json())

    const res1 = await fetch("http://localhost:4000/secret",{
        headers:{"x-api-key":"wrong"}
    })

    console.log(res1.status)
    console.log(await res1.json())

    const res2 = await fetch("http://localhost:4000/secret",{
        headers:{"x-api-key":"letmein"}
    })

    console.log(res2.status)
    console.log(await res2.json())
})