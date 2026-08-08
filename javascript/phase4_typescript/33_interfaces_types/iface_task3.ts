type ID = string
type Status = "active"|"inactive"

type Product = {
    id: ID,
    name: string,
    status: Status
}

const p1 :Product= {
    id : "P-001",
    name: "Iphone",
    status: "active"
}
// const p2 :Product= {
//     id : "P-001",
//     name: "Iphone",
//     status: "delete"
// } //Type '"delete"' is not assignable to type 'Status'.The expected type comes from property 'status' which is declared here on type 'Product'

// interface mId: string - this cannot be done, this is only doable with type