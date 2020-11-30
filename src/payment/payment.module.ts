import {Module} from '@nestjs/common';
import {PaymentController} from './payment.controller';
import {PaymentService} from './payment.service';
import {MongooseModule} from "@nestjs/mongoose";
import {Minute, MinuteSchema} from "./schemas/minute.schema";
import {Receipt, ReceiptSchema} from "./schemas/receipt.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: Minute.name, schema: MinuteSchema},
            {name: Receipt.name, schema: ReceiptSchema},
        ])
    ],
    controllers: [PaymentController],
    providers: [PaymentService],
    exports: [PaymentService]
})
export class PaymentModule {

}
