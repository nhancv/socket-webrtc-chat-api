import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';
import {ApiProperty} from "@nestjs/swagger";

@Schema()
export class UserNotification extends Document {
    @Prop({required: true})
    @ApiProperty()
    uid: string;

    @Prop({default: true})
    @ApiProperty()
    activity_related_profile: boolean;

    @Prop({default: true})
    @ApiProperty()
    latest_news_our_service: boolean;

    @Prop({default: true})
    @ApiProperty()
    message_from_out_partner: boolean;

    @Prop({type: Date, default: Date.now})
    @ApiProperty()
    created_at: number;

    @Prop({type: Date, default: Date.now})
    @ApiProperty()
    updated_at: number;

    constructor(uid: string, activity_related_profile: boolean, latest_news_our_service: boolean, message_from_out_partner: boolean, created_at: number, updated_at: number) {
        super();
        this.uid = uid;
        this.activity_related_profile = activity_related_profile;
        this.latest_news_our_service = latest_news_our_service;
        this.message_from_out_partner = message_from_out_partner;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}

export const UserNotificationSchema = SchemaFactory.createForClass(UserNotification);
