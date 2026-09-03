import { createServer, IncomingMessage, ServerResponse } from "node:http";

interface Items {
    id: string,
    name: string
}

interface Config {
    value: string
}

let myItems: Items[] = [];
let myConfig: Config = { value: "" };
let idCount = 0;

const server = createServer((req: IncomingMessage, res: ServerResponse) => {

    console.log(`${req.method} ${req.url}`);

    const parts = (req.url || "").split("/").filter(Boolean);

    // POST /items
    if (req.method === "POST" && parts[0] === "items") {

        let body: string = "";

        req.on("data", (chunks: Buffer) => {
            body += chunks;
        });

        req.on("end", () => {

            try {
                const pBody = JSON.parse(body) as Partial<Items>;

                if (typeof pBody.name !== "string" || !pBody.name) {
                    res.writeHead(400, {
                        "content-type": "application/json"
                    });

                    res.end(JSON.stringify({
                        error: "Name required"
                    }));

                    return;
                }

                const itemId = "ID-" + (++idCount);

                const item: Items = {
                    id: itemId,
                    name: pBody.name
                };

                myItems.push(item);

                res.writeHead(201, {
                    "content-type": "application/json"
                });

                res.end(JSON.stringify({
                    item: item
                }));
            }

            catch (err) {
                res.writeHead(400, {
                    "content-type": "application/json"
                });

                res.end(JSON.stringify({
                    error: "Invalid JSON"
                }));
            }
        });

        return;
    }

    // PUT /config
    if (req.method === "PUT" && parts[0] === "config") {

        let body: string = "";

        req.on("data", (chunks: Buffer) => {
            body += chunks;
        });

        req.on("end", () => {

            try {
                const pBody = JSON.parse(body) as Partial<Config>;

                if (typeof pBody.value !== "string") {
                    res.writeHead(400, {
                        "content-type": "application/json"
                    });

                    res.end(JSON.stringify({
                        error: "Value required"
                    }));

                    return;
                }

                myConfig.value = pBody.value;

                res.writeHead(200, {
                    "content-type": "application/json"
                });

                res.end(JSON.stringify(myConfig));
            }

            catch (err) {
                res.writeHead(400, {
                    "content-type": "application/json"
                });

                res.end(JSON.stringify({
                    error: "Invalid JSON"
                }));
            }
        });

        return;
    }

    // GET /items
    if (req.method === "GET" && parts[0] === "items") {

        res.writeHead(200, {
            "content-type": "application/json"
        });

        res.end(JSON.stringify(myItems));

        return;
    }

    // GET /config
    if (req.method === "GET" && parts[0] === "config") {

        res.writeHead(200, {
            "content-type": "application/json"
        });

        res.end(JSON.stringify(myConfig));

        return;
    }
});

server.listen(4000, async() => {
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