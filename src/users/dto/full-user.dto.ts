import {CreateUserDto} from "./create-user.dto";

export class FullUserDto extends CreateUserDto {

    uid: string;

    constructor(name: string, email: string, username: string, gender: number, ages: number, uid: string, avatar: string) {
        super(name, email, username, gender, ages, avatar);
        this.uid = uid;
    }
}
