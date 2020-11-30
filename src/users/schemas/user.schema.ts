import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';
import {ApiProperty} from "@nestjs/swagger";

@Schema()
export class User extends Document {
    @Prop({required: true})
    @ApiProperty()
    uid: string;

    @Prop()
    @ApiProperty()
    name: string;

    @Prop()
    @ApiProperty()
    email: string;

    @Prop()
    @ApiProperty()
    username: string;

    @Prop({default: 0})
    @ApiProperty({description: 'gender index: 0 - male, 1 - female'})
    gender: number; //gender index: 0 - male, 1 - female

    // from 18 to 24
    // from 25 to 34
    // from 35 to 44
    // from 45+
    @Prop({default: 0})
    @ApiProperty({description: 'option index: 0, 1, 2 [from 18 to 24, from 25 to 34, from 35 to 44, from 45+]'})
    ages: number; // option index: 0, 1, 2

    @Prop()
    @ApiProperty()
    avatar?: string;

    @Prop({type: Date, default: Date.now})
    @ApiProperty()
    created_at: number;

    @Prop({type: Date, default: Date.now})
    @ApiProperty()
    updated_at: number;

    constructor(uid: string, name: string, email: string, username: string, gender: number, ages: number, avatar: string, created_at: number, updated_at: number) {
        super();
        this.uid = uid;
        this.name = name;
        this.email = email;
        this.username = username;
        this.gender = gender;
        this.ages = ages;
        this.avatar = avatar;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}

export const UserSchema = SchemaFactory.createForClass(User);
