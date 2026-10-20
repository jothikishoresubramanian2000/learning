import { Controller, Get, Param,Query,Post, Body} from "@nestjs/common";
import { PricingService } from "./pricing.service.js";

@Controller('/pricing')
export class PricingController{

    constructor(private readonly pricingservice: PricingService){}

    @Get(":amount")
    gettax(@Param("amount") amount: number,@Query("rate") rate: number):number{

        return this.pricingservice.getTax(amount,rate)
    }

    @Post()
    getfinalrate(@Body() body:{amount: number}):number{

        return this.pricingservice.getFinalRate(body)
    }
}