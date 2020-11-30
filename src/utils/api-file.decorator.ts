import * as nestjsSwagger from "@nestjs/swagger";

// How to use
// @Post('avatar')
// @UseGuards(JwtAuthGuard)
// @UseInterceptors(FileInterceptor('file’))
// @ApiBearerAuth()
// @ApiConsumes('multipart/form-data')
// @ApiBodyFile()
// @ApiOperation({summary: 'Upload avatar'})
// async uploadFile(@AuthJwt() payload: JwtPayload, @UploadedFile() file) {
//
// }
export const ApiBodyFile = (fileName: string = 'file'): MethodDecorator => <T>(
    target: any,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>,
) => {
    nestjsSwagger.ApiBody({
        schema: {
            type: 'object',
            properties: {
                [fileName]: {
                    type: 'file',
                    format: 'binary',
                },
            },
        },
    })(target, propertyKey, descriptor);
};
