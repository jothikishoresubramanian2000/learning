import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient({
  datasourceUrl: "postgresql://learning_app:learning_app_pw@localhost:5434/learning_db?schema=public",
});

async function withTenant<T>(
  tenantId: string,
  fn: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;
    return fn(tx);
  });
}

async function main() {

    // await prisma.user.deleteMany()
    // await prisma.org.deleteMany()
    // await prisma.tenant.deleteMany()

//     const tenant1 = await prisma.tenant.create({ data: { name: "Acme" } });
//     const org1 = await prisma.org.create({data: {name: "Engineering",tenantId: tenant1.id}})
//    // const user = await prisma.user.create({data: {name:"Kishore",orgId: org1.id,role: "ADMIN"}})

//     const tenant2 = await prisma.tenant.create({ data: { name: "Globex" } });
//     const org2 = await prisma.org.create({data: {name: "Sales",tenantId: tenant2.id}})

    // console.log(await prisma.tenant.findMany({select:{id:true,name:true}}))
    // console.log(await prisma.org.findUnique({where:{id: org1.id},select:{id:true,name:true}}))

    const acmeOrgs = await withTenant("37b6e535-054e-4811-b384-5c1313fce2b8", (tx) =>
        tx.org.findMany({ include: { tenant: true } })
    );
    console.log("as Acme:", acmeOrgs);

    const globexOrgs = await withTenant("4837c986-e381-4189-b33f-8d2e724d738b", (tx) =>
        tx.org.findMany({ include: { tenant: true } })
    );
    console.log("as Globex:", globexOrgs);

    const noContextAtAll = await prisma.org.findMany({ include: { tenant: true } });

    console.log("as failClose:", noContextAtAll);

    // console.log(await prisma.user.findMany({select:{id:true,name:true}}))
}

main();
