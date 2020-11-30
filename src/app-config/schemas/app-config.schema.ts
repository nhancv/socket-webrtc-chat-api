import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';
import {ApiProperty} from "@nestjs/swagger";

@Schema()
export class AppConfig extends Document {
    @Prop({required: true})
    @ApiProperty()
    version: string;

    @Prop({required: true})
    @ApiProperty({description: 'iOS version code'})
    ios_version: number;

    @Prop({required: true})
    @ApiProperty({description: 'Android version code'})
    ad_version: number;

    @Prop({type: Date, default: Date.now})
    @ApiProperty()
    created_at: number;

    @Prop({type: Date, default: Date.now})
    @ApiProperty()
    updated_at: number;

    constructor(version: string, ios_version: number, ad_version: number, created_at: number, updated_at: number) {
        super();
        this.version = version;
        this.ios_version = ios_version;
        this.ad_version = ad_version;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}

export const AppConfigSchema = SchemaFactory.createForClass(AppConfig);
