export const ROLES = ["admin","member","viewer"] as const
type Role = typeof ROLES[number];

const isValidRole=(role: string):role is Role=>{

    return (ROLES as readonly string[]).includes(role)
}

console.log(isValidRole("admin"))     
console.log(isValidRole("member"))  
console.log(isValidRole("superuser")) 
