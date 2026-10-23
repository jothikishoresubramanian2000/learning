import { Module } from "@nestjs/common";
import { AuditController } from "./audit.controller.js";
import { ActionGuard } from "./audit-log.guard.js";


@Module({

    imports : [],
    controllers: [AuditController],
    providers: [ActionGuard]
})
export class AuditModule{}