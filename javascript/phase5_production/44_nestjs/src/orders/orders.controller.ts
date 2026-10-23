import { Body, Controller,Post } from "@nestjs/common";
import { ValidationPipe } from "@nestjs/common";
import { OrderDto } from "./order.dto.js";


@Controller("orders")
export class OrderController{

    @Post()
    createOrder(@Body(new ValidationPipe()) body: OrderDto){
        return `Order placed: ${body.quantity} x ${body.item}`
    }
}