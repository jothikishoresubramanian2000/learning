import {Store} from "./store_task1"
import {tenants,orgs,users} from "./store_task2"

tenants.create({ id: "T-01", name: "Acme" });
orgs.create({ id: "O-01", tenantId: "T-01", name: "Engineering" });
orgs.create({ id: "O-02", tenantId: "T-01", name: "Sales" });

console.log(orgs.listByTenant("T-01").map(o => o.name));
console.log(orgs.update("O-01", { name: "Platform Engineering" }).name);
console.log(orgs.delete("O-02"));
console.log(orgs.listByTenant("T-01").map(o => o.name));
