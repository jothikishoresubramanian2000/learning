import { Module, Options } from "@nestjs/common";
import { PricingController } from "./pricing.controller.js";
import { PricingService } from "./pricing.service.js";

@Module({
    imports: [],
    controllers: [PricingController],
    providers: [PricingService,{provide: "TAX_RATE",useValue: 0.18},
        {
            provide: "FINAL_RATE",
            useFactory: (taxRate: number) => taxRate + 0.02,
            inject: ["TAX_RATE"],  
        }

    ]
})
export class PricingModule{}