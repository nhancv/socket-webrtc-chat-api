
export class BundleNotificationDto {

    uid: string;
    name: string;
    avatar: string;

    constructor(uid: string, name: string, avatar: string) {
        this.uid = uid;
        this.name = name;
        this.avatar = avatar;
    }
}
