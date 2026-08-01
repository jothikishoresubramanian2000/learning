class InvalidSignature extends Error{
    constructor(message){
        super(message)
        this.name = "InvalidSignature"
    }
}

class TokenErrors extends Error{
    constructor(message){
        super(message)
        this.name = "TokenErrors"
    }
}
class UserContext{

    #user = new Map()
    #secret = "mysecret"
    fakeHash = (str) => {return str}

    createToken(payload){
        const jsonPayload = JSON.stringify(payload)
        const encodedPayload = Buffer.from(jsonPayload).toString("base64");
        const signature = this.fakeHash(encodedPayload +this.#secret)
        return encodedPayload+"."+signature
    }

    decode(token){
        const [encodedPayload, signature] = token.split(".");
    }
}

module.exports = {UserContext,TokenErrors,InvalidSignature}