
const fs = require("fs/promises")
const path = require("path")
const pr =[{
    id: "PR-001",
    amount: 5000
}]


async function main() {
    const folderPath = path.join(__dirname,"store")
    await fs.mkdir(folderPath,{recursive: true})
    const filePath = path.join(__dirname,"store","odata.json")
    await fs.writeFile(filePath,JSON.stringify(pr))
    console.log(`Saved`)
    const read = JSON.parse(await fs.readFile(filePath,"utf8"))
    console.log(read[0].amount)
    console.log(path.basename(filePath))
    console.log(path.extname(filePath))
    
}
main()