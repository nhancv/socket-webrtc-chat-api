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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistoriesController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
const auth_decorator_1 = require("../auth/auth.decorator");
const histories_service_1 = require("./histories.service");
const users_service_1 = require("../users/users.service");
const friends_service_1 = require("../friends/friends.service");
const user_settings_service_1 = require("../user-settings/user-settings.service");
const user_relationship_dto_1 = require("../friends/dto/user-relationship.dto");
let HistoriesController = class HistoriesController {
    constructor(usersService, friendsService, historiesService, userSettingsService) {
        this.usersService = usersService;
        this.friendsService = friendsService;
        this.historiesService = historiesService;
        this.userSettingsService = userSettingsService;
    }
    async getHistories(payload) {
        const response = {};
        const uid = payload.uid;
        let histories = (await this.historiesService.getHistories(uid));
        const blocks = await this.userSettingsService.findBlockers(uid);
        const blockMap = {};
        for (let i = 0; i < blocks.length; i++) {
            blockMap[blocks[i].block_uid] = true;
        }
        histories = histories.filter(((value, index) => !blockMap.hasOwnProperty(value.friend_id)));
        const results = [];
        for (let i = 0; i < histories.length; i++) {
            const history = histories[i];
            const relation = await this.friendsService.getRelationship(uid, history.friend_id);
            if (relation) {
                results.push(relation);
            }
        }
        response.data = results;
        return response;
    }
};
__decorate([
    common_1.Get('all'),
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    swagger_1.ApiOperation({ summary: 'Get histories' }),
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOkResponse({
        description: 'Histories',
        type: [user_relationship_dto_1.UserRelationshipDto],
    }),
    __param(0, auth_decorator_1.AuthJwt()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HistoriesController.prototype, "getHistories", null);
HistoriesController = __decorate([
    swagger_1.ApiTags('histories'),
    common_1.Controller('histories'),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        friends_service_1.FriendsService,
        histories_service_1.HistoriesService,
        user_settings_service_1.UserSettingsService])
], HistoriesController);
exports.HistoriesController = HistoriesController;
//# sourceMappingURL=histories.controller.js.map