const http = require("http");

const students = new Map();
students.set("S-01", { id: "S-01", name: "Ravi", marks: 80 }); 
students.set("S-02", { id: "S-02", name: "kishore", marks: 100 }); 

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);


    const parts = req.url.split("/").filter(Boolean)

    if(req.method === "GET" && parts[0]==="students" && parts[1]){

        if(students.has(parts[1])){
            res.writeHead(200,{"content-type":"application/json"});
            res.end(JSON.stringify(students.get(parts[1])));
            return
        }
        else{
            res.writeHead(404,{"content-type":"application/json"});
            res.end(JSON.stringify({error: "Student not found"}));
            return;
        }

    }
    if(req.method === "GET" && parts[0]==="students" && !parts[1]){
        res.writeHead(200,{"content-type":"application/json"});
        res.end(JSON.stringify([...students.values()]));
        return;
    }

    if(req.method === "POST" && parts[0] ==="students"){
        let body = ""
        req.on("data",(chunks)=>{body += chunks;})
        req.on("end",()=>{
            const jsonBody = JSON.parse(body)
            students.set(jsonBody.id,jsonBody)
            res.writeHead(201,({"content-type":"application/json"}))
            res.end(JSON.stringify(students.get(jsonBody.id)))
           
        })
        return;
    }
    res.writeHead(404,({"content-type":"application/json"}))
    res.end(JSON.stringify({error:"Not route found"}))

})

server.listen(3001, () => console.log("Server on http://localhost:3001"));