import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class ActionGuard implements CanActivate{

    constructor(private reflector: Reflector){}

    canActivate(context: ExecutionContext): boolean{
        const action = this.reflector.get<string>("action",context.getHandler())
        console.log(`This route has action: ${action}`)
        return true
    }
}