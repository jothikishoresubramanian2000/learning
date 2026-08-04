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

    if(req.method === "PATCH" && parts[0]==="students" && parts[1]){
        const id = parts[1]
        let body =""
        req.on("data",(chunks)=>{body+=chunks});
        req.on("end",()=>{
            let stdobj
            try{
                stdobj =JSON.parse(body)
            }
            catch{
                res.writeHead(400,{"content-type":"application/json"})
                res.end(JSON.stringify({error: "Invalid JSON"}))
                return;
            }

            if(!students.has(id)){
                res.writeHead(404,{"content-type":"application/json"})
                res.end(JSON.stringify({error:"id not exists"}))
                return;
            }
            const {name,marks} =stdobj;
            if(name !== undefined){
                students.get(id).name = name
            }
            if(marks !== undefined){
                students.get(id).marks = marks
                
            }
            res.writeHead(200,{"content-type":"application/json"})
            res.end(JSON.stringify(students.get(id)))
        })
        return;
    }
    if(req.method === "POST" && parts[0] ==="students"){
        let body = ""
        req.on("data", (chunk) => {
            body += chunk;
        });
        req.on("end",()=>{
            let jsonBody
            try{
                jsonBody = JSON.parse(body);
            }
            catch(err){
                res.writeHead(400, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    error: "Invalid JSON"
                }));

                return;
            }
            

            if(!jsonBody.id||!jsonBody.name){
                res.writeHead(400,{"content-type":"application/json"})
                res.end(JSON.stringify({error:"Missing fields"}))
                return
            }
            if(students.has(jsonBody.id)){
                res.writeHead(409,{"content-type":"application/json"})
                res.end(JSON.stringify({error:"id already exists"})) 
                return     
            }
            students.set(jsonBody.id,jsonBody)
            res.writeHead(201,{"content-type":"application/json"})
            res.end(JSON.stringify(students.get(jsonBody.id)))
            return;
        })
        

        return;
    }

    if(req.method ==="DELETE" && parts[0] ==="students"&&parts[1]){
        const id = parts[1];
        if(students.has(id)){
            students.delete(id)
            res.writeHead(204,{"content-type":"application/json"})
            res.end()
            return;
        }
        res.writeHead(404,{"content-type":"application/json"})
        res.end(JSON.stringify({error:"id not exists"}))
        return;

    }
    res.writeHead(404,({"content-type":"application/json"}))
    res.end(JSON.stringify({error:"Not route found"}))

})

server.listen(3003, () => console.log("Server on http://localhost:3003"));