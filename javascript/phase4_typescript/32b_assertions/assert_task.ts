const nums = [5,10,15];

const last = nums.at(-1)!
const dec = last.toFixed(2)

console.log(dec)


const config = {
    env: "prod",
    retry: 3
} as const

//config.retry = 9 - Cannot assign to 'retry' because it is a read-only property.

console.log(config)

interface id{id: string}

const raw1 = `{"id": "PR-001"}`
const raw2 = `{"amount": 500}`

const raw1obj = JSON.parse(raw1) as Partial<id>
const raw2obj = JSON.parse(raw2) as Partial<id>

const detect =(obj: Partial<id>):void=>{
    if(typeof obj.id === "string"){
        console.log(obj.id)
    }
    else console.log("invalid")
}

detect(raw1obj)
detect(raw2obj)

type prmObj = Record<string, string[]>

const pr = {admin: ["create","delete"],viewer: ["view"]} satisfies prmObj

console.log(pr.admin)