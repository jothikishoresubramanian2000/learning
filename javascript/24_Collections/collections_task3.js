const pr =  [
  { user: "Kishore", dept: "IT" },
  { user: "Jk",      dept: "HR" },
  { user: "Kishore", dept: "FIN" },
  { user: "Kishore", dept: "HR" }
]

const unique = [...new Set(pr.map(pr => pr.user))]

console.log(unique)


let dupMap = new Map()

for(dups of pr){
    dupMap.set(dups.user, (dupMap.get(dups.user)||0)+1)
}

for (let [key,val] of dupMap){
    console.log(`${key}: ${val}`)
}