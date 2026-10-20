import { Module } from "@nestjs/common";
import { ItemController } from "./items.controller.js";

@Module(
    {
        imports: [],
        controllers: [ItemController]
    }
)
export class ItemModule{}