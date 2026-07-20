const purchaseRequest = new Map([    ["PR-001",5000],
    ["PR-002",8000],
["PR-003",2000]]
)

console.log(purchaseRequest.get("PR-002"))
for(let [keys,value] of purchaseRequest){
    console.log(`${keys}: ${value}`)
}