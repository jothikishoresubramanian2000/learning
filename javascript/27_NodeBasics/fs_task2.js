const fs = require("fs/promises")



async function read () {
    await fs.writeFile("data.json","PR-001 submitted")
    
    const first = await fs.readFile("data.json","utf8")
    console.log(first)
    await fs.appendFile("data.json","PR-002 submitted")
    const both = await fs.readFile("data.txt", "utf8");
    console.log(both)
}

read()

