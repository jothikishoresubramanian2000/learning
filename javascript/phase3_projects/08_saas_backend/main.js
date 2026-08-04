const {DuplicateId,NotFound,TenantManagement} = require("./tenantService")

const {UserDuplicateId,UserOrRoleNotFound,UserManagement} = require("./userService")


const myTenants = new TenantManagement()
const myUsers = new UserManagement(myTenants)   // inject the tenant service (DI)
function run(action){

    try{
        action()
    }
    catch(err){
        if(err instanceof DuplicateId|| err instanceof NotFound||err instanceof UserDuplicateId|| err instanceof UserOrRoleNotFound){
            console.log(err.message)
        }
        else throw err
    }
}


//---------add tenant ------------------------//
run(()=>{myTenants.createTenant("T-01","Acme");console.log("Tenant created")})
run(()=>{myTenants.createTenant("T-02","Globex");console.log("Tenant created")})
run(()=>{myTenants.createTenant("T-02","Globex");console.log("Tenant created")})

//---------------get tenant by id-------------//

run(()=>{console.log(myTenants.getTenant("T-01"));})

//............list tenants-----------//

run(()=>{console.table(myTenants.listTenants())})

run(()=>{myUsers.addUser("T-01",{ id:"U-01", name:"Kishore", role:"admin" });console.log("user created")});
run(()=>{myUsers.addUser("T-01",{ id:"U-02", name:"Ravi", role:"member" });console.log("user created")});
run(()=>{myUsers.addUser("T-02",{ id:"U-03", name:"John", role:"admin" });console.log("user created")});
run(()=>{myUsers.addUser("T-01",{ id:"U-04", name:"Bad", role:"superuser" });console.log("user created")});

//------------list users--------------------//
run(()=>{console.table(myUsers.listUsers("T-01"))});

//----------get users-------------//
console.log("Get user by tenant id and user id")
run(() =>{console.log(myUsers.getUser("T-01","U-03"))});
run(() =>{console.log(myUsers.getUser("T-02","U-03"))});

//-----------update role------------//
run(()=>{myUsers.updateRole("T-01","U-02","viewer");console.log("Updated role")});
run(()=>{console.table(myUsers.listUsers("T-01"))});

//---------------count----------------//
run(()=>{console.log(myUsers.countByTenant("T-01"));});