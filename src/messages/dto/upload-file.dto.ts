import {ApiProperty} from "@nestjs/swagger";

export class UploadFileDto {

    @ApiProperty()
    original: string;

    @ApiProperty()
    type: string; // file or image

    @ApiProperty()
    preview?: string; // only for image

    @ApiProperty()
    size?: string; // w x h,  only for image

    constructor(original: string, type: string, preview: string, size: string) {
        this.original = original;
        this.type = type;
        this.preview = preview;
        this.size = size;
    }
}
