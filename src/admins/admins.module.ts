import {Module} from '@nestjs/common';
import {AdminsService} from './admins.service';
import {AdminsController} from './admins.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {Admin, AdminSchema} from "./schemas/admin.schema";

/**
 * This module to mange administer
 */

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: Admin.name, schema: AdminSchema},
        ])
    ],
    providers: [AdminsService],
    controllers: [AdminsController],
    exports: [AdminsService]
})
export class AdminsModule {
}
