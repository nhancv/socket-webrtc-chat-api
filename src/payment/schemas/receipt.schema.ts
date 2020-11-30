import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';
import {ApiProperty} from "@nestjs/swagger";

@Schema()
export class Receipt extends Document {
    @Prop({required: true})
    @ApiProperty()
    uid: string;

    @Prop({required: true})
    @ApiProperty()
    receipt: string;

    @Prop({required: true})
    @ApiProperty()
    device_id: string;

    @Prop({required: true})
    @ApiProperty()
    platform: string;

    @Prop({type: Date, default: Date.now})
    @ApiProperty()
    created_at: number;

    @Prop({type: Date, default: Date.now})
    @ApiProperty()
    updated_at: number;

    constructor(uid: string, receipt: string, device_id: string, platform: string, created_at: number, updated_at: number) {
        super();
        this.uid = uid;
        this.receipt = receipt;
        this.device_id = device_id;
        this.platform = platform;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}

export const ReceiptSchema = SchemaFactory.createForClass(Receipt);
