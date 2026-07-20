const checkEmail =(user)=>{
    if(user.email === "taken@x.com"){
        throw "email taken"
    }
    else{
        return user
    }
}

const createUser = (user)=>{
    return new Promise((resolve) =>{
        setTimeout(() => {
            user.id = "U-01 onboarded"
            resolve(user);
        }, 1000);
    })

}

const sendWelcome = (user)=>{
    return new Promise((resolve) =>{
        setTimeout(() => {
        resolve( `welcome send`)
    }, 1000);
    })
}

const assignRole=(user)=>{
    return new Promise((resolve)=>{
        resolve(`role: member`)
    })

}

async function flow (user){
    try{
        let checked = await checkEmail(user)
        let created = await createUser(checked)
        
        let [send,assign] = await Promise.all([sendWelcome(created),assignRole(created)])
        console.log(`${created.id} | ${send}|${assign}`)
    }
    catch(err){
        console.log(err)
    }
}

const user = { name: "Kishore", email: "k@x.com" }
flow(user)