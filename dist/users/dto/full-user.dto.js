"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FullUserDto = void 0;
const create_user_dto_1 = require("./create-user.dto");
class FullUserDto extends create_user_dto_1.CreateUserDto {
    constructor(name, email, username, gender, ages, uid, avatar) {
        super(name, email, username, gender, ages, avatar);
        this.uid = uid;
    }
}
exports.FullUserDto = FullUserDto;
//# sourceMappingURL=full-user.dto.js.map