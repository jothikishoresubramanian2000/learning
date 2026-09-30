import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();


async function main(){
    
   
    try{
        await prisma.$transaction(async(tx)=>{

            const tenant = await tx.tenant.create({data:{name:"Initech"}})
            await tx.org.create({data:{name:"Sales", tenantId: tenant.id}})
            await tx.org.create({data:{name:"Sales",tenantId: tenant.id}})
        })
    }
    catch(err){
        console.log("transaction failed rolled back")
    }

    console.log(await prisma.org.findMany({where: {name: "Sales"}}))

    const count = await prisma.$queryRaw`
    SELECT t.name, COUNT(o.id) FROM "Tenant" t
    LEFT JOIN "Org" o ON o.tenant_id = t.id
    GROUP BY t.name
    `;

    console.log(count)
}

main()