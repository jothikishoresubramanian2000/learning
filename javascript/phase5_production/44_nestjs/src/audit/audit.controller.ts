import { Controller,Get,UseGuards } from "@nestjs/common"
import { AdminAction } from "./audit-action.decorator.js"
import { ActionGuard } from "./audit-log.guard.js"
import { RequestId } from "./request-id.decorator.js"

@Controller("audit")
export class AuditController{

    @AdminAction("delete-user")
    @UseGuards(ActionGuard)

    @Get()
    adminaction(){
        return "ok"
    }

    @AdminAction("remove-user")
    @UseGuards(ActionGuard)
    @Get("combined")
    combined(@RequestId("x-request-id") id: string){
        return `Request id is ${id}`
    }
    
    @Get(":id")
    giveid(@RequestId("x-request-id") id: string){
        return `Request id is ${id}`
    }


}

