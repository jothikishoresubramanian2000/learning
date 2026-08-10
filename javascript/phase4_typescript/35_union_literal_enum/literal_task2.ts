type Role = "admin" | "member"|"viewer"


const setRole = (role: Role):void =>{

    console.log(role)

}


setRole("admin")
setRole("viewer")

//setRole("superuser") //Argument of type '"superuser"' is not assignable to parameter of type 'Role'.

// In js
// const Role = Object.freeze({
//         ADMIN: "admin",
//         EDITOR: "editor",
//         VIEWER: "viewer"
//     })
// const setRole = (role)=>{
// if(Object.values(Role).includes(role)) // this whole if part is ripped out by TS, and even caught at compile time
//        console.log(role)
// }