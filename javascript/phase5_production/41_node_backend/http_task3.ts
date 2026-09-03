import { createServer, IncomingMessage, ServerResponse } from "node:http";


const myServer = createServer((req: IncomingMessage, res: ServerResponse)=>{

    console.log(`${req.method} ${req.url}`)

    const parts = (req.url || "").split("/").filter(Boolean)

    const accept = req.headers["accept"] ?? "";

    if(req.method === "GET" && parts[0] === "tenants"&& accept.includes("application/json")){

        res.writeHead(200,{"content-type":"application/json"})
        res.end(JSON.stringify({id:parts[1],name:"kishore"}))
    }

    else if(req.method === "GET" && parts[0] === "tenants"){

        res.writeHead(200,{"content-type":"text/plain"})
        res.end(`id: ${parts[1]},name: kishore`)
    }
})

myServer.listen(4000,async()=>{console.log("server listening at port 4000")

    const res1 = await fetch("http://localhost:4000/tenants/T-01",{
        headers: {"accept":"application/json"}
    })

    console.log(res1.status);
    
    console.log(await res1.json())
    console.log(res1.headers.get("content-type"));   
      

    const res2 = await fetch("http://localhost:4000/tenants/T-01",{
        headers: {"accept":"text/plain"}
    })

    console.log(res2.status);
    console.log(res2.headers.get("content-type")); 
    console.log(await res2.text())
})