import { app } from "./layered_task2";
import "dotenv/config"


app.listen(4000,async()=>{

    const apiKey = process.env.API_KEY
    const res = await fetch("http://localhost:4000/items",{
    })

    console.log(res.status)
    console.log(await res.json())

    const res1 = await fetch("http://localhost:4000/items",{
        headers:{"x-api-key":"wrong"}
    })

    console.log(res1.status)
    console.log(await res1.json())

    const res2 = await fetch("http://localhost:4000/items",{
        headers:{"x-api-key":apiKey!}
    })

    console.log(res2.status)
    console.log(await res2.json())
})