import {Connection, Model} from 'mongoose';
import {Injectable} from '@nestjs/common';
import {InjectConnection, InjectModel} from '@nestjs/mongoose';
import {User} from './schemas/user.schema';
import {CreateUserDto} from "./dto/create-user.dto";
import {UserAvatar} from "./dto/user-avatar.dto";
import {FullUserDto} from "./dto/full-user.dto";

@Injectable()
export class UsersService {
    constructor(@InjectConnection() private connection: Connection,
                @InjectModel(User.name) private userModel: Model<User>) {
    }

    async findUserByUid(uid: string): Promise<User | null> {
        return await this.userModel.findOne({uid: uid}, {'_id': 0, '__v': 0}).exec();
    }

    async findUserByUsername(username: string): Promise<User | null> {
        return await this.userModel.findOne({username: username}, {'_id': 0, '__v': 0}).exec();
    }

    async searchUsersByUsername(username: string): Promise<User[] | null> {
        return await this.userModel.find({username: new RegExp('^' + username, 'i')}, {'_id': 0, '__v': 0}).exec();
    }

    async deleteUser(uid: string): Promise<boolean> {
        const res = await this.userModel.deleteOne({uid: uid}).exec();
        return (res && res.deletedCount ? res.deletedCount > 0 : false);
    }

    async updateUser(uid: string, createUserDto: CreateUserDto): Promise<User | null> {
        const fullUserDto: FullUserDto = {
            ...createUserDto,
            uid: uid
        }
        const res = await this.userModel.updateOne({uid: uid}, {
            ...fullUserDto,
            updated_at: Date.now()
        }, {upsert: true});
        if (res && res.n > 0) {
            return this.findUserByUid(uid);
        } else {
            return null;
        }
    }

    async createUser(uid: string, createUserDto: CreateUserDto): Promise<User | null> {
        const fullUserDto: FullUserDto = {
            ...createUserDto,
            uid: uid
        }
        const userModel = new this.userModel(fullUserDto);
        const user = await userModel.save();
        if (user) {
            return this.findUserByUid(uid);
        }
        return null;
    }

    async updateAvatar(uid: string, userAvatar: UserAvatar): Promise<any> {
        return this.userModel.updateOne({uid: uid}, userAvatar, {upsert: false});
    }

    async findAll(): Promise<User[]> {
        return this.userModel.find({}, {'_id': 0, '__v': 0}).exec();
    }

    async findAllInList(uids: string[]): Promise<User[]> {
        return this.userModel.find({uid: {'$in': uids}}, {'_id': 0, '__v': 0}).exec();
    }

    async findAllGuest(): Promise<User[]> {
        return this.userModel.find({uid: /guest_/}, {'_id': 0, '__v': 0}).exec();
    }
}
