import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';
import {ApiProperty} from "@nestjs/swagger";

@Schema()
export class UserBlock extends Document {
    @Prop({required: true})
    @ApiProperty()
    uid: string;

    @Prop({required: true})
    @ApiProperty()
    block_uid: string;

    @Prop()
    @ApiProperty()
    reason?: string;

    @Prop({type: Date, default: Date.now})
    @ApiProperty()
    created_at: number;

    @Prop({type: Date, default: Date.now})
    @ApiProperty()
    updated_at: number;

    constructor(uid: string, block_uid: string, created_at: number, updated_at: number) {
        super();
        this.uid = uid;
        this.block_uid = block_uid;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}

export const UserBlockSchema = SchemaFactory.createForClass(UserBlock);
