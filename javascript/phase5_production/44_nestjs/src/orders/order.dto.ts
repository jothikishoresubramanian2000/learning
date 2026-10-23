import { IsInt,IsString,Min,Max, min } from "class-validator";


export class OrderDto{

    @IsString()
    item: string

    @IsInt()
    @Min(1)
    quantity: number

    @IsInt()
    @Min(0)
    price: number

}

