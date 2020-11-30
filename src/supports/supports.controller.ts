import { Controller } from '@nestjs/common';
import {ApiTags} from "@nestjs/swagger";

@ApiTags('supports')
@Controller('supports')
export class SupportsController {}
