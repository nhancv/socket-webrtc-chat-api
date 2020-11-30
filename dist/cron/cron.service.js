"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var CronService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const users_service_1 = require("../users/users.service");
const moment_1 = __importDefault(require("moment"));
const app_service_1 = require("../app.service");
const realtime_service_1 = require("../realtime/realtime.service");
const guest_service_1 = require("../guest/guest.service");
let CronService = CronService_1 = class CronService {
    constructor(appService, usersService, realtimeService, guestService) {
        this.appService = appService;
        this.usersService = usersService;
        this.realtimeService = realtimeService;
        this.guestService = guestService;
        this.logger = new common_1.Logger(CronService_1.name);
    }
    async cleanGuestUserCron() {
        const allGuests = await this.usersService.findAllGuest();
        for (let i = 0; i < allGuests.length; i++) {
            const user = allGuests[i];
            const guestExpiresMinute = this.appService.getConfigService().get('GUEST_EXPIRES_MINUTE');
            const now = moment_1.default();
            const createdAt = moment_1.default(user.created_at);
            const expiresExpected = createdAt.add(guestExpiresMinute, 'minutes');
            if (expiresExpected.isBefore(now)) {
                this.realtimeService.disconnectSocketWithUid(user.uid);
                await this.guestService.deleteAllGuestInstance(user.uid);
            }
        }
    }
};
__decorate([
    schedule_1.Cron(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CronService.prototype, "cleanGuestUserCron", null);
CronService = CronService_1 = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [app_service_1.AppService,
        users_service_1.UsersService,
        realtime_service_1.RealtimeService,
        guest_service_1.GuestService])
], CronService);
exports.CronService = CronService;
//# sourceMappingURL=cron.service.js.map