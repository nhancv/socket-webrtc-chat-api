import {Module} from '@nestjs/common';
import {AuthService} from './auth.service';
import {PassportModule} from "@nestjs/passport";
import {JwtModule} from "@nestjs/jwt";
import {JwtStrategy} from "./jwt.strategy";
import {AuthController} from './auth.controller';
import {UsersModule} from "../users/users.module";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {GuestModule} from "../guest/guest.module";
import {AdminsModule} from "../admins/admins.module";

// https://docs.nestjs.com/techniques/authentication
@Module({
    imports: [
        AdminsModule,
        UsersModule,
        GuestModule,
        PassportModule.register({
            defaultStrategy: 'jwt',
            session: false,
        }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('SECRET_KEY'),
                signOptions: {
                    expiresIn: configService.get<string>('EXPIRES_IN'),
                },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService],
})
export class AuthModule {
}
