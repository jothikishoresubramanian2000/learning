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

    const res3 = await fetch("http://localhost:4000/pricing/100")
    console.log(await res3.json())

    const res4 = await fetch("http://localhost:4000/pricing/100?rate=0.1")
    console.log(await res4.json())

    const res5 = await fetch("http://localhost:4000/pricing/",{
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({amount: 100})
    })
    console.log(await res5.json())

  });


}
await bootstrap();


