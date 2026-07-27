const { log } = require("console")
const fs = require("fs/promises")
const pr = [ { id: "PR-001", amount: 5000 }, { id: "PR-002", amount: 8000 } ]


async function run(){

    

    try{
        await fs.writeFile("jdata.json",JSON.stringify(pr,null,2))
        const jPr = await fs.readFile("jdata.json","utf8")
        
        const jsonPr = JSON.parse(jPr)

        const total = jsonPr.reduce((sum,n)=> sum+n.amount,0)
        console.log("saved");
        
        console.log(`total:`,total);
        //await JSON.parse(fs.readFile("data.json","utf8")) - fail path
    }
    catch(err){
        console.log("Invalid JSON")
    }

}

run()


