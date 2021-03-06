"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrationModule = void 0;
const common_1 = require("@nestjs/common");
const migration_service_1 = require("./migration.service");
const app_config_module_1 = require("../app-config/app-config.module");
const messages_module_1 = require("../messages/messages.module");
const admins_module_1 = require("../admins/admins.module");
const migration_service_1_0_16_service_1 = require("./migration-service_1_0_16.service");
const migration_service_1_0_19_service_1 = require("./migration-service_1_0_19.service");
let MigrationModule = class MigrationModule {
};
MigrationModule = __decorate([
    common_1.Module({
        imports: [
            app_config_module_1.AppConfigModule,
            messages_module_1.MessagesModule,
            admins_module_1.AdminsModule
        ],
        providers: [
            migration_service_1.MigrationService,
            migration_service_1_0_16_service_1.MigrationService_1_0_16,
            migration_service_1_0_19_service_1.MigrationService_1_0_19,
        ],
        exports: [migration_service_1.MigrationService]
    })
], MigrationModule);
exports.MigrationModule = MigrationModule;
//# sourceMappingURL=migration.module.js.map