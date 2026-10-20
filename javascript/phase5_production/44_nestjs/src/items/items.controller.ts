import { Controller, Get } from "@nestjs/common";


@Controller('/items')
export class ItemController{

    @Get()
    getItems(){
        return [`item1`,`item2`]
    }
}