import { ROLES } from "./model_task2";
type Role = typeof ROLES[number];
export interface Tenant{
    id: string,
    name: string
}

export interface Org{

    id: string,
    tenantId: string
    name: string
}

export interface User{
    id: string
    name: string,
    orgId: string
    role: Role
}

const t: Tenant = { id: "T-01", name: "Acme" };
const o: Org = { id: "O-01", tenantId: "T-01", name: "Engineering" };
const u: User = { id: "U-01", orgId: "O-01", name: "Kishore", role: "admin" };