import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';
import {ApiProperty} from "@nestjs/swagger";

/**
 Custom message:
 (1)+ from a -> to b: 123, is_sender: true
 (2)+ from a -> to b: 123, is_sender: false
 (3)+ from b -> to a: xyz, is_sender: true
 (4)+ from b -> to a: xyz, is_sender: false

 Filter: select * from messages where (left=uid and is_sender = true) or (right=uid and is_sender = false)
 Ex:
 - From a:
 (1)+ from a -> to b: 123, is_sender: true
 (4)+ from b -> to a: xyz, is_sender: false

 - From b:
 (2)+ from a -> to b: 123, is_sender: false
 (3)+ from b -> to a: xyz, is_sender: true
 */

@Schema()
export class Message extends Document {
    @Prop({required: true})
    @ApiProperty({description: 'sender uid'})
    left: string;

    @Prop({required: true})
    @ApiProperty({description: 'recipient uid'})
    right: string;

    @Prop({required: true})
    @ApiProperty()
    body: string;

    @Prop({required: true})
    @ApiProperty()
    device_id: string;

    @Prop({default: false})
    @ApiProperty({description: 'The message from server delivered to B device'})
    received: boolean;  //The message from server delivered to B device

    @Prop({default: false})
    @ApiProperty({description: 'The message from B device was read by user'})
    read: boolean; //The message from B device was read by user

    @Prop({default: false})
    @ApiProperty()
    edited: boolean;

    @Prop({default: false})
    @ApiProperty()
    system: boolean;

    @Prop({default: -1})
    @ApiProperty({description: '-1: default, 0: green, 1: red'})
    color: number; // -1: default, 0: green, 1: red

    @Prop()
    @ApiProperty()
    is_sender: boolean;

    @Prop({type: Date, default: Date.now})
    @ApiProperty()
    created_at: number;

    @Prop({type: Date, default: Date.now})
    @ApiProperty()
    updated_at: number;

    constructor(left: string, right: string, body: string, device_id: string, read: boolean, received: boolean, system: boolean, color: number, edited: boolean, is_sender: boolean, created_at: number, updated_at: number) {
        super();
        this.left = left;
        this.right = right;
        this.body = body;
        this.device_id = device_id;
        this.read = read;
        this.received = received;
        this.system = system;
        this.color = color;
        this.edited = edited;
        this.is_sender = is_sender;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}

export const MessageSchema = SchemaFactory.createForClass(Message);
