import { createParamDecorator,ExecutionContext } from "@nestjs/common";

export const RequestId = createParamDecorator((data: string, ctx: ExecutionContext) => {
  const request =  ctx.switchToHttp().getRequest();
  return request.headers[data] ?? "unknown"
});