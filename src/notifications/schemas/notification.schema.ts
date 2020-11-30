import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';
import {ApiProperty} from "@nestjs/swagger";

@Schema()
export class Notification extends Document {
    @Prop({required: true})
    @ApiProperty()
    uid: string;

    @Prop({required: true})
    @ApiProperty()
    device_id: string;

    @Prop({required: true})
    @ApiProperty()
    fcm_token: string;

    @Prop({default: 0})
    @ApiProperty()
    unread: number;

    @Prop({type: Date, default: Date.now})
    @ApiProperty()
    created_at: number;

    @Prop({type: Date, default: Date.now})
    @ApiProperty()
    updated_at: number;

    constructor(uid: string, device_id: string, fcm_token: string, unread: number, created_at: number, updated_at: number) {
        super();
        this.uid = uid;
        this.device_id = device_id;
        this.fcm_token = fcm_token;
        this.unread = unread;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
