import {Controller, Get} from '@nestjs/common';
import {AppService} from './app.service';
import {ApiOkResponse, ApiOperation} from "@nestjs/swagger";
import {BaseResponse} from "./models/responses/base.response";
import * as faceapi from "face-api.js";

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {
    }

    @Get()
    @ApiOkResponse({
        description: 'Test app works',
        type: String,
    })

    @ApiOperation({summary: 'hello'})
    getHello(): BaseResponse<string> {
        const response: BaseResponse<string> = {}
        response.data = this.appService.getHello();
        return response;
    }
}
