import {ApiProperty} from "@nestjs/swagger";

export class DetectGenderDto {

    @ApiProperty()
    age: number;

    @ApiProperty()
    gender: string;

    @ApiProperty()
    probability: number;

    constructor(age: number, gender: string, probability: number) {
        this.age = age;
        this.gender = gender;
        this.probability = probability;
    }
}