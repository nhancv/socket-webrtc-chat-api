import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';
import {ApiProperty} from "@nestjs/swagger";

@Schema()
export class Admin extends Document {
    @Prop({required: true})
    @ApiProperty()
    uid: string;

    @Prop({required: true})
    @ApiProperty({description: 'system, admin'})
    role: string; // system, admin

    @Prop({type: Date, default: Date.now})
    @ApiProperty()
    created_at: number;

    @Prop({type: Date, default: Date.now})
    @ApiProperty()
    updated_at: number;

    constructor(uid: string, role: string, created_at: number, updated_at: number) {
        super();
        this.uid = uid;
        this.role = role;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
