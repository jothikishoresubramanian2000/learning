import { Module } from '@nestjs/common';
import { ItemModule } from './items/items.module.js';
import { HelloModule } from './hello/hello.module.js';
import { GreetingModule } from './greeting/greeting.module.js';
import { PricingModule } from './pricing/pricing.module.js';
import { AuditModule } from './audit/audit.module.js';
import { OrderModule } from './orders/orders.module.js';
@Module({
  imports: [ItemModule,HelloModule,GreetingModule.forRoot({name: "kishore"}),PricingModule,AuditModule,OrderModule],
})
export class AppModule {}
