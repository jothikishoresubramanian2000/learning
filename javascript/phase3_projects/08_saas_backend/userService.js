class UserDuplicateId extends Error{
    constructor(message){
        super(message)
        this.name = "UserDuplicateId"
    }
}

class UserOrRoleNotFound extends Error{
    constructor(message){
        super(message)
        this.name = "UserOrRoleNotFound"
    }
}


const Role = {
    ADMIN: "admin",
    MEMBER: "member",
    VIEWER: "viewer"
}


class UserManagement{

    #userData = new Map()
    #tenants                        // injected tenant service (Dependency Injection)

    constructor(tenantService){
        this.#tenants = tenantService
    }

    addUser(tenantId,user){

        // verify the tenant EXISTS before adding a user to it.
        // getTenant throws NotFound if the tenant id is unknown — so a user can
        // never be attached to a nonexistent tenant.
        this.#tenants.getTenant(tenantId)

        if(this.#userData.has(user.id)){
            throw new UserDuplicateId("user already exists")
        }
        if(!(Object.values(Role)).includes(user.role)){
            throw new UserOrRoleNotFound("role not found")
        }
        const newUser = {tenantId,id:user.id,name:user.name,role:user.role}
        this.#userData.set(user.id,newUser)
        return newUser                           // return the created user, not the Map
    }

    listUsers(id){
        return [...this.#userData.values()].filter(itm => itm.tenantId === id)
    }

    getUser(tenantId,userId){
        if(this.#userData.has(userId)){
            if(this.#userData.get(userId).tenantId === tenantId){
                return this.#userData.get(userId)
            }
            else{throw new UserOrRoleNotFound("user not found for this tenant")}
        }
        else throw new UserOrRoleNotFound("user not found")
    }
    updateRole(tenantId,userId,roles){
        if(!(Object.values(Role)).includes(roles)){
            throw new UserOrRoleNotFound("role not found")
        }
        if(this.#userData.has(userId)){
            if(this.#userData.get(userId).tenantId === tenantId){
                this.#userData.get(userId).role = roles
                return this.#userData.get(userId)
            }
            else{throw new UserOrRoleNotFound("user not found for this tenant")}
        }
        else throw new UserOrRoleNotFound("user not found")
    }
    countByTenant(tid){

        return [...this.#userData.values()].filter(id => id.tenantId === tid).length
    }

    removeUser(tenantId,userId){
        if(this.#userData.has(userId)){
            if(this.#userData.get(userId).tenantId === tenantId){
                return this.#userData.delete(userId)
            }
            else{throw new UserOrRoleNotFound("user not found for this tenant")}
        }
        else throw new UserOrRoleNotFound("user not found")
    }
}

module.exports ={UserManagement,UserDuplicateId,UserOrRoleNotFound}