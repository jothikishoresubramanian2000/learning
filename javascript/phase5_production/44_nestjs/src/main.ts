import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { Post } from '@nestjs/common';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 4000
  await app.listen(port, async()=>{

    console.log(`server is listening in port ${port}`)

    // const res1 = await fetch("http://localhost:4000/items")
    // console.log(await res1.json())

    // const res2 = await fetch("http://localhost:4000/greeting")
    // console.log(await res2.text())

    // const res3 = await fetch("http://localhost:4000/pricing/100")
    // console.log(await res3.json())

    // const res4 = await fetch("http://localhost:4000/pricing/100?rate=0.1")
    // console.log(await res4.json())

    // const res5 = await fetch("http://localhost:4000/pricing/",{
    //   method: "POST",
    //   headers: {"Content-Type":"application/json"},
    //   body: JSON.stringify({amount: 100})
    // })
    // console.log(await res5.json())

  //   const res4 = await fetch("http://localhost:4000/audit")
  //   console.log(await res4.text())

  //   const res5 = await fetch("http://localhost:4000/audit/108",{
  //     headers: {"x-request-id": "abc-123"},
  //   })
  //   console.log(await res5.text())

  //   const res6 = await fetch("http://localhost:4000/audit/combined",{
  //     headers: {"x-request-id": "abc-333"},
  //   })
  //   console.log(await res6.text())
  // });

    const res7 = await fetch("http://localhost:4000/orders",{
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ item: "Keyboard", quantity: 2, price: 1500 })
    })
    console.log(await res7.text())
  });
  
}
await bootstrap();


