import "dotenv/config"; 


const requireEnv = (param: string) =>{

    const value = process.env[param] ?? undefined

    if(!value){
        throw new Error(`Missing env variable of ${param}`)
    }
    return value
}

console.log(requireEnv("PORT"))
console.log(requireEnv("API_KEY"))