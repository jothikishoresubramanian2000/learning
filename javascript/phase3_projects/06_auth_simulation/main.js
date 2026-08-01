const {UserError,UserManager,InvalidRole} =require("./authService")


const userManage = new UserManager()
function run(action){
    try{
        action()
    }
    catch(err){
        if(err instanceof UserError||err instanceof InvalidRole){
            console.log(err.message)
        }
        else throw err
    }
}

run(()=>{userManage.signUp("Kishore","pass123","admin");console.log(`user added`);})
run(()=>{userManage.signUp("revi","revi456","viewer");console.log(`user added`);})
run(()=>{userManage.signUp("Kishore","pass123","admin");console.log(`user added`);})
run(()=>{userManage.signUp("bad","pass123","superuser");console.log(`user added`);})
//--------------------login----------//

run(()=>{console.log(userManage.login("Kishore","wrongpass"))})
run(()=>{console.log(userManage.login("Kishore","pass123"))})


//-----------------
run(()=>{console.log(userManage.can("Kishore", userManage.Permission.DELETE))})
run(()=>{console.log(userManage.can("revi", userManage.Permission.DELETE))})
run(()=>{console.log(userManage.can("revi", userManage.Permission.VIEW))})