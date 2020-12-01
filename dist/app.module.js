"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const realtime_module_1 = require("./realtime/realtime.module");
const mongoose_1 = require("@nestjs/mongoose");
const users_module_1 = require("./users/users.module");
const nestjs_firebase_admin_1 = require("@aginix/nestjs-firebase-admin");
const auth_module_1 = require("./auth/auth.module");
const admin = __importStar(require("firebase-admin"));
const in_memory_db_1 = require("@nestjs-addons/in-memory-db");
const schedule_1 = require("@nestjs/schedule");
const cron_service_1 = require("./cron/cron.service");
const friends_module_1 = require("./friends/friends.module");
const notifications_module_1 = require("./notifications/notifications.module");
const histories_module_1 = require("./histories/histories.module");
const messages_module_1 = require("./messages/messages.module");
const payment_module_1 = require("./payment/payment.module");
const user_settings_module_1 = require("./user-settings/user-settings.module");
const guest_module_1 = require("./guest/guest.module");
const admins_module_1 = require("./admins/admins.module");
const supports_module_1 = require("./supports/supports.module");
const migration_module_1 = require("./migration/migration.module");
const app_config_module_1 = require("./app-config/app-config.module");
let AppModule = class AppModule {
    configure(consumer) {
    }
};
AppModule = __decorate([
    common_1.Module({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: path_1.join(__dirname, '..', 'public'),
                exclude: ['/api*'],
            }),
            nestjs_firebase_admin_1.FirebaseAdminModule.forRootAsync({
                useFactory: () => ({
                    credential: admin.credential.cert(require("../secret/firebase-adminsdk.json"))
                })
            }),
            mongoose_1.MongooseModule.forRoot((_a = process.env.MONGODB_URL) !== null && _a !== void 0 ? _a : ''),
            in_memory_db_1.InMemoryDBModule.forRoot(),
            schedule_1.ScheduleModule.forRoot(),
            realtime_module_1.RealtimeModule,
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            friends_module_1.FriendsModule,
            notifications_module_1.NotificationsModule,
            histories_module_1.HistoriesModule,
            messages_module_1.MessagesModule,
            payment_module_1.PaymentModule,
            user_settings_module_1.UserSettingsModule,
            guest_module_1.GuestModule,
            admins_module_1.AdminsModule,
            supports_module_1.SupportsModule,
            migration_module_1.MigrationModule,
            app_config_module_1.AppConfigModule
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, cron_service_1.CronService],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map