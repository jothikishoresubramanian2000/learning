import {Store} from "./store_task1"

import{Tenant,Org,User} from "./model_task1"

class TenantStore extends Store<Tenant> {}

class OrgStore extends Store<Org>{

    constructor(private readonly tenantData: TenantStore){super()}

    override create(item: Org): Org {
        this.tenantData.getById(item.tenantId)

        return super.create(item)

    }
    listByTenant(tenantId: string): Org[]{
        this.tenantData.getById(tenantId)
        return [...this.data.values()].filter(id => id.tenantId === tenantId)
    }
}

class UserStore extends Store<User>{

    constructor(private readonly orgData: OrgStore){super()}

    override create(item: User): User {
        this.orgData.getById(item.orgId)

        return super.create(item)
    }
    listByOrg(orgId: string): User[]{
        this.orgData.getById(orgId)
        return [...this.data.values()].filter(id => id.orgId === orgId)
    }
}

export const tenants = new TenantStore();
export const orgs = new OrgStore(tenants)
export const users = new UserStore(orgs)

// tenants.create({ id: "T-01", name: "Acme" });
// console.log(orgs.create({ id: "O-01", tenantId: "T-01", name: "Engineering" }));

// try {
//   orgs.create({ id: "O-02", tenantId: "T-99", name: "Ghost" });
// } catch (e) {
//   console.log((e as Error).name, (e as Error).message);
// }

