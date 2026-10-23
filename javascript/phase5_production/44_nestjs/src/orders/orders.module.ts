import { Module } from "@nestjs/common";
import { OrderController } from "./orders.controller.js";


@Module({

    imports: [],
    controllers: [OrderController]
})
export class OrderModule{}