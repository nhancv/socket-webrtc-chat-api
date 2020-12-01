import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {ServeStaticModule} from "@nestjs/serve-static";
import {join} from 'path';
import {RealtimeModule} from './realtime/realtime.module';
import {MongooseModule} from "@nestjs/mongoose";
import {UsersModule} from "./users/users.module";
import {FirebaseAdminModule} from '@aginix/nestjs-firebase-admin'
import {AuthModule} from './auth/auth.module';
import * as admin from 'firebase-admin';
import {InMemoryDBModule} from "@nestjs-addons/in-memory-db";
import {ScheduleModule} from '@nestjs/schedule';
import {CronService} from './cron/cron.service';
import {FriendsModule} from './friends/friends.module';
import {NotificationsModule} from './notifications/notifications.module';
import {HistoriesModule} from './histories/histories.module';
import {MessagesModule} from './messages/messages.module';
import {PaymentModule} from './payment/payment.module';
import {UserSettingsModule} from './user-settings/user-settings.module';
import {GuestModule} from './guest/guest.module';
import {AdminsModule} from './admins/admins.module';
import {SupportsModule} from './supports/supports.module';
import {AwsS3Module} from './aws-s3/aws-s3.module';
import {MigrationModule} from './migration/migration.module';
import {AppConfigModule} from './app-config/app-config.module';

@Module({
    imports: [
        ConfigModule.forRoot({isGlobal: true}),
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'public'),
            exclude: ['/api*'],
        }),
        FirebaseAdminModule.forRootAsync({
            useFactory: () => ({
                credential: admin.credential.cert(require("../secret/firebase-adminsdk.json"))
            })
        }),
        MongooseModule.forRoot(process.env.MONGODB_URL ?? ''),
        InMemoryDBModule.forRoot(),
        ScheduleModule.forRoot(),
        RealtimeModule,
        UsersModule,
        AuthModule,
        FriendsModule,
        NotificationsModule,
        HistoriesModule,
        MessagesModule,
        PaymentModule,
        UserSettingsModule,
        GuestModule,
        AdminsModule,
        SupportsModule,
        // AwsS3Module,
        MigrationModule,
        AppConfigModule
    ],
    controllers: [AppController],
    providers: [AppService, CronService],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {

    }
}
