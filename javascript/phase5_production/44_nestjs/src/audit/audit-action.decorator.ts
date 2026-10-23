import { SetMetadata } from "@nestjs/common";

export const AdminAction = (action: string) => SetMetadata("action",action)