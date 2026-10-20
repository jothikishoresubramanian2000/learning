import { Module, DynamicModule} from "@nestjs/common";
import { GreetingController,GreetingService } from "./greeting.controller.js";
export class GreetingModule {
  static forRoot(options: { name: string }): DynamicModule {
    return {
      module: GreetingModule,
      providers: [
        { provide: "GREETING_OPTIONS", useValue: options },
        GreetingService,
      ],
      controllers: [GreetingController],
      exports: ["GREETING_OPTIONS"],
    };
  }
}