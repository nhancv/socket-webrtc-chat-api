import {Module} from '@nestjs/common';
import {SupportsController} from './supports.controller';
import {SupportsService} from './supports.service';
import {MongooseModule} from "@nestjs/mongoose";
import {Support, SupportSchema} from "./schemas/support.schema";
import {Ticket, TicketSchema} from "./schemas/ticket.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: Support.name, schema: SupportSchema},
            {name: Ticket.name, schema: TicketSchema},
        ])
    ],
    controllers: [SupportsController],
    providers: [SupportsService],
    exports: [SupportsService]
})
export class SupportsModule {
}
