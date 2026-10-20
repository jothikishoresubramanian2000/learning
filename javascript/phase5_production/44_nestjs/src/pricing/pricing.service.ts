import { Inject,Injectable } from "@nestjs/common";

@Injectable()
export class PricingService{

    constructor(
        @Inject("TAX_RATE") private readonly taxrate: number,
        @Inject("FINAL_RATE") private readonly frate: number){}
    getTax(amount: number,rate:number):number{
        return amount * (rate??this.taxrate)
    }

    getFinalRate(item: {amount:number}){

        return this.frate * item.amount
    }
}