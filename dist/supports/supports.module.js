"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportsModule = void 0;
const common_1 = require("@nestjs/common");
const supports_controller_1 = require("./supports.controller");
const supports_service_1 = require("./supports.service");
const mongoose_1 = require("@nestjs/mongoose");
const support_schema_1 = require("./schemas/support.schema");
const ticket_schema_1 = require("./schemas/ticket.schema");
let SupportsModule = class SupportsModule {
};
SupportsModule = __decorate([
    common_1.Module({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: support_schema_1.Support.name, schema: support_schema_1.SupportSchema },
                { name: ticket_schema_1.Ticket.name, schema: ticket_schema_1.TicketSchema },
            ])
        ],
        controllers: [supports_controller_1.SupportsController],
        providers: [supports_service_1.SupportsService],
        exports: [supports_service_1.SupportsService]
    })
], SupportsModule);
exports.SupportsModule = SupportsModule;
//# sourceMappingURL=supports.module.js.map