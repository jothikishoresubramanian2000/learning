const {UserContext,TokenErrors,InvalidSignature} = require("./tokenService")

const userData = new UserContext()

function run(action){

    try{
        action()
    }
    catch(err){
        if(err instanceof TokenErrors||err instanceof InvalidSignature){
            console.log(err.message)
        }
        else throw err
    }
}

const myToken = null
run(()=>{mytoken = userData.createToken({ username: "kishore", role: "admin" ,exp:Date.now() + 60000 })})
run(()=>{userData.decode(myToken)})
