import { Controller, Get } from "@nestjs/common";
import { HelloService } from "./hello.service.js";


@Controller('')
export class HelloController{

    constructor(private readonly appservice: HelloService){}

    @Get()
    gethello(){
        return this.appservice.getHello()
    }
}