"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FullHistoryDto = void 0;
const create_history_dto_1 = require("./create-history.dto");
class FullHistoryDto extends create_history_dto_1.CreateHistoryDto {
    constructor(uid, friend_id) {
        super(friend_id);
        this.uid = uid;
    }
}
exports.FullHistoryDto = FullHistoryDto;
//# sourceMappingURL=full-history.dto.js.map