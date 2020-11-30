import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';
import {ApiProperty} from "@nestjs/swagger";

@Schema()
export class UserContent extends Document {
    @Prop({required: true})
    @ApiProperty()
    uid: string;

    @Prop({default: true})
    @ApiProperty()
    not_dubious_content: boolean;

    @Prop({default: true})
    @ApiProperty()
    quick_connection: boolean;

    @Prop({type: Date, default: Date.now})
    @ApiProperty()
    created_at: number;

    @Prop({type: Date, default: Date.now})
    @ApiProperty()
    updated_at: number;

    constructor(uid: string, not_dubious_content: boolean, quick_connection: boolean, created_at: number, updated_at: number) {
        super();
        this.uid = uid;
        this.not_dubious_content = not_dubious_content;
        this.quick_connection = quick_connection;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}

export const UserContentSchema = SchemaFactory.createForClass(UserContent);
