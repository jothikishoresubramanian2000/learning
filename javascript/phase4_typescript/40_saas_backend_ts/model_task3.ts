import{Tenant,Org,User} from "./model_task1"

class TenantStore{

    
    #tenantData : Map<string,Tenant> = new Map()

}

class OrgStore{

    #orgData: Map<string,Org> = new Map()
    constructor(private readonly tenantData: TenantStore){}
}

class UserStore{

    #userData: Map<string,User> = new Map()
    constructor(private readonly orgData: OrgStore){}
}

const tenants = new TenantStore();
const orgs = new OrgStore(tenants);
const users = new UserStore(orgs);
console.log(orgs);