import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();


async function main() {

    const tenant = await prisma.tenant.create({ data: { name: "Globex" } });
    const org = await prisma.org.create({data: {name: "Sales",tenantId: tenant.id}})
    try{
        
        const org1 = await prisma.org.create({data: {name: "Sales",tenantId: tenant.id}})
    }
    catch(err){
        if(err instanceof PrismaClientKnownRequestError){

            console.log(err.code)
        }
    }
   

    try{
        
        const org2 = await prisma.org.update({where:{id:"does not exit"},data:{name:"Acme"}})
    }
    catch(err){
        if(err instanceof PrismaClientKnownRequestError){

            console.log(err.code)
        }
    }
}

main();

