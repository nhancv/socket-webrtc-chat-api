import {CreateHistoryDto} from "./create-history.dto";

export class FullHistoryDto extends CreateHistoryDto {

    uid: string;

    constructor(uid: string, friend_id: string) {
        super(friend_id);
        this.uid = uid;
    }
}
