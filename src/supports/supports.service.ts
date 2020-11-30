import {Injectable} from '@nestjs/common';
import {InjectConnection, InjectModel} from "@nestjs/mongoose";
import {Connection, Model} from "mongoose";
import {Support} from "./schemas/support.schema";
import {SupportDto} from "./dto/support.dto";
import {Ticket} from "./schemas/ticket.schema";
import {TicketDto} from "./dto/ticket.dto";


/**
 * User A - message - User B
 * [Support A, B..] - message -> User X
 * Supporter can be a User
 * -----
 * User type: support
 */
@Injectable()
export class SupportsService {

    constructor(
        @InjectConnection() private connection: Connection,
        @InjectModel(Support.name) private supportModel: Model<Support>,
        @InjectModel(Ticket.name) private ticketModel: Model<Ticket>,
    ) {
    }

    // Support
    async findSupports(client: string): Promise<Support[] | null> {
        return await this.supportModel.find({client_id: client}, {'_id': 0, '__v': 0}).exec();
    }

    async findSupport(client: string, supporter: string): Promise<Support | null> {
        return await this.supportModel.findOne({client_id: client, supporter_id: supporter}, {'_id': 0, '__v': 0}).exec();
    }

    async deleteSupport(client: string, supporter: string): Promise<boolean> {
        const res = await this.supportModel.deleteOne({client_id: client, supporter_id: supporter}).exec();
        return (res && res.deletedCount ? res.deletedCount > 0 : false);
    }

    async createSupport(client: string, supportDto: SupportDto): Promise<Support | null> {
        const model = new this.supportModel({
            ...supportDto,
            client: client
        });
        const modelRes = await model.save();
        if (modelRes) {
            return this.findSupport(client, supportDto.supporter_id);
        }
        return null;
    }

    async updateSupport(client: string, supportDto: SupportDto): Promise<Support | null> {
        const supporter = supportDto.supporter_id;
        const res = await this.supportModel.updateOne({client_id: client, supporter_id: supporter}, {
            ...supportDto,
            client_id: client,
            updated_at: Date.now()
        });
        if (res && res.n > 0) {
            return this.findSupport(client, supporter);
        } else {
            return null;
        }
    }

    // Tickets
    async findTickets(ticketId: string): Promise<Ticket[] | null> {
        return await this.ticketModel.find({ticket_id: ticketId}, {'_id': 0, '__v': 0}).exec();
    }

    async findTicket(_id: string): Promise<Ticket | null> {
        return await this.ticketModel.findOne({_id: _id}, {'_id': 0, '__v': 0}).exec();
    }

    async deleteTicket(_id: string): Promise<boolean> {
        const res = await this.ticketModel.deleteOne({_id: _id}).exec();
        return (res && res.deletedCount ? res.deletedCount > 0 : false);
    }

    async createTicket(ticketDto: TicketDto): Promise<Ticket | null> {
        const model = new this.ticketModel({
            ...ticketDto,
        });
        const modelRes = await model.save();
        if (modelRes) {
            return this.findTicket(modelRes._id);
        }
        return null;
    }

    async updateTicket(_id: string, ticketDto: TicketDto): Promise<Ticket | null> {
        const res = await this.ticketModel.updateOne({_id: _id}, {
            ...ticketDto,
            updated_at: Date.now()
        });
        if (res && res.n > 0) {
            return this.findTicket(_id);
        } else {
            return null;
        }
    }

}
