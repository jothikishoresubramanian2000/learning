const http = require("http");
const {DuplicateId,NotFound,ValidationError,TenantManagement} = require("./tenantService")

const {UserDuplicateId,UserOrRoleNotFound,UserManagement} = require("./userService");


const myTenants = new TenantManagement()
const myUsers = new UserManagement(myTenants) 

myTenants.createTenant("T-01","Acme")
myTenants.createTenant("T-02","Globex")
myUsers.addUser("T-01",{ id:"U-01", name:"Kishore", role:"admin" })
myUsers.addUser("T-02",{ id:"U-02", name:"Jk", role:"member" })

function run(action, res) {
    try {
        action();
    }
    catch (err) {

        let status = 500;

        if (err instanceof ValidationError) {
            status = 400;                        // bad input
        }
        else if (err instanceof DuplicateId ||
            err instanceof UserDuplicateId) {
            status = 409;                        // conflict
        }
        else if (err instanceof NotFound ||
                 err instanceof UserOrRoleNotFound) {
            status = 404;                        // not found
        }

        res.writeHead(status, {
            "content-type": "application/json"
        });

        res.end(JSON.stringify({
            error: err.message
        }));
    }
}


const server = http.createServer((req, res) => {

    console.log(`${req.method} ${req.url}`);


    const parts = req.url.split("/").filter(Boolean)

    if(req.method === "GET" && parts[0] ==="tenants"){
        const tenantId = parts[1]
        const users = parts[2]
        const userId = parts[3]
        
        if(tenantId != null && users == null){
            run(()=>{
                res.writeHead(200,{"content-type":"application/json"})
                res.end(JSON.stringify({tenant: myTenants.getTenant(tenantId)}));
            },res)
            return;
        }

        if(users != null){

            if(userId != null){
                run(()=>{
                    const user = myUsers.getUser(tenantId,userId);
                    res.writeHead(200,{"content-type":"application/json"});
                    res.end(JSON.stringify({user}));
                },res)
                return;
            }
            run(()=>{
                res.writeHead(200,{"content-type":"application/json"});
                res.end(JSON.stringify({user: myUsers.listUsers(tenantId)}));
            },res)
            return;
        }
            
        

        run(()=>{
            res.writeHead(200,{"content-type":"application/json"})
            res.end(JSON.stringify({tenant: myTenants.listTenants()}));
        },res)
        return;
    }

    if(req.method === "POST" && parts[0] ==="tenants"){
        let body = ""
        const tenantId = parts[1]
        const users = parts[2]

        req.on("data",(chunks)=> body += chunks);
        req.on("end",()=>{
            let parseBody;
            try{
                parseBody = JSON.parse(body)
            }
            catch{
                res.writeHead(400,{"content-type":"application/json"})
                res.end(JSON.stringify({error: "Invalid JSON"}))
                return;
            }
            
           
            if(tenantId != null){
                if(users != null){
                    run(()=>{
                        const user = myUsers.addUser(tenantId,parseBody)
                        res.writeHead(201,{"content-type":"application/json"});
                        res.end(JSON.stringify({user}));
                    },res)
                    return;
                }
            }

            run(()=>{
                const tenant = myTenants.createTenant(parseBody.id,parseBody.name);
                res.writeHead(201,{"content-type":"application/json"})
                res.end(JSON.stringify({tenant}))
            },res)
            return;

        })
        return;   // route matched — the async req.on("end") will send the response
    }

    if(req.method === "PATCH" && parts[0] ==="tenants"){
        let body = ""
        const tenantId = parts[1]
        const users = parts[2]
        const userId = parts[3]

        req.on("data",(chunks)=> body += chunks);
        req.on("end",()=>{
            let parseBody;
            try{
                parseBody = JSON.parse(body)
            }
            catch{
                res.writeHead(400,{"content-type":"application/json"})
                res.end(JSON.stringify({error: "Invalid JSON"}))
                return;
            }
            
           
            if(tenantId != null){
                if(users != null){
                    run(()=>{
                        const upt = myUsers.updateRole(tenantId,userId,parseBody.role)
                        res.writeHead(200,{"content-type":"application/json"});
                        res.end(JSON.stringify({user: upt}));
                    },res)
                    return;
                }
            }

        })
        return;   // route matched
    }

    if(req.method === "DELETE" && parts[0] ==="tenants"){
        let body = ""
        const tenantId = parts[1]
        const users = parts[2]
        const userId = parts[3]
        
        if(tenantId != null){
            if(users != null){
                run(()=>{
                    myUsers.removeUser(tenantId,userId)
                    res.writeHead(204);            // 204 No Content — no body
                    res.end();
                },res)
                return;
            }
        }
        return;   // route matched
    }

    // no route matched → 404
    res.writeHead(404,{"content-type":"application/json"})
    res.end(JSON.stringify({error:"route not found"}))
})
server.listen(3003, () => console.log("Server on http://localhost:3003"));