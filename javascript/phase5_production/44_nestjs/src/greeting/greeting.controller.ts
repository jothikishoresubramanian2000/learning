
import {Inject, Injectable, Controller, Get } from "@nestjs/common";

@Injectable()
export class GreetingService {
  constructor(@Inject("GREETING_OPTIONS") private readonly options: { name: string }) {}

  buildGreeting(): string {
    return `Hello, ${this.options.name}`;
  }
}

@Controller("greeting")
export class GreetingController {
  constructor(private readonly greetingService: GreetingService) {}

  @Get()
  getGreeting(): string {
    return this.greetingService.buildGreeting();
  }
}