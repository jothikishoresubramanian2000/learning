class UserError extends Error{
    constructor(message){
        super(message)
        this.name = "UserError"
    }
}

class InvalidRole extends Error{
    constructor(message){
        super(message)
        this.name = "InvalidRole"
    }
}

class UserManager{
    Role = Object.freeze({
        ADMIN: "admin",
        EDITOR: "editor",
        VIEWER: "viewer"
    })

    Permission = Object.freeze({
        CREATE: "create",
        DELETE: "delete",
        VIEW: "view",
        EDIT:"edit"
    })

    rolePermissions = {
        [this.Role.ADMIN]:  [this.Permission.CREATE, this.Permission.DELETE, this.Permission.VIEW, this.Permission.EDIT], 
        [this.Role.EDITOR]: [this.Permission.VIEW, this.Permission.EDIT],                                        
        [this.Role.VIEWER]: [this.Permission.VIEW],                                                         
    };
    #userData = new Map()

    fakeHash = (password) => {return `hashed(${password})`;}


    signUp(username,password,role){

        if (this.#userData.has(username)) throw new UserError("user already exists");
        if (!Object.values(this.Role).includes(role)) throw new InvalidRole("Invalid role");
        const passwordHash = this.fakeHash(password); 
        this.#userData.set(username, { username, passwordHash, role });
    }
    login(username,password){
        if(!this.#userData.has(username)) throw new UserError("user not found");
        if (!(this.#userData.get(username).passwordHash === this.fakeHash(password))) throw new UserError("Invalid credentials");
        const role = this.#userData.get(username).role
        return {username,role};
    }
    listUsers(){
        return ([...this.#userData.values()].map(usr =>({username: usr.username,role: usr.role})))
    }
    can(username, permission) {
        if (!this.#userData.has(username)) throw new UserError("user not found");
        const role = this.#userData.get(username).role;
        return this.rolePermissions[role].includes(permission);
    }

}

module.exports ={UserError,UserManager,InvalidRole}
