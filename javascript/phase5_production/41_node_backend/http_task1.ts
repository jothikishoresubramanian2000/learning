import { createServer, IncomingMessage, ServerResponse } from "node:http";

const secret: string = "letmein";

// FIXED: Corrected invalid syntax. Changed to either an empty object or an interface.
const myShape = {}; 

// FIXED: Replaced 'any' with the proper HTTP types
const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    console.log(`${req.method} ${req.url}`);

    // FIXED: Added fallback (req.url || "") because IncomingMessage's url can be undefined
    const parts = (req.url || "").split("/").filter(Boolean);

    if (req.method === "GET" && parts[0] === "secret") {

        const apiKey = req.headers["x-api-key"];

        if (!apiKey) {
            res.writeHead(401, {
                "content-type": "application/json"
            });
            res.end(JSON.stringify({ error: "missing key" }));
            return;
        }

        if (apiKey !== secret) {
            res.writeHead(403, {
                "content-type": "application/json"
            });
            res.end(JSON.stringify({ error: "wrong secret" }));
            return;
        }

        res.writeHead(200, {
            "content-type": "application/json"
        });
        res.end(JSON.stringify({ message: "success" }));
    }
});

server.listen(4000, async() => {
    console.log("server listening at port 4000");

    const res = await fetch("http://localhost:4000/secret",{
        headers:{"x-api-key":"wrong"}
    })

    console.log(res.status)
    console.log(await res.json())

    const res2 = await fetch("http://localhost:4000/secret",{
    })
    console.log(res2.status)
    console.log(await res2.json())

    const res3 = await fetch("http://localhost:4000/secret",{
        headers:{"x-api-key":"letmein"}
    })
    console.log(res3.status)
    console.log(await res3.json())
});