import { IsString } from 'class-validator';
import { BasicType, InfoType, ProjectName } from '@chiyu-bit/canon.root';
import { ApiProperty } from '@nestjs/swagger';

abstract class BaseWeeklyInfoQuery {
    @IsString()
    basicType: BasicType;

    // TODO: custom validator
    // @IsDateString()
    // @Transform(({ value }) => formatDate(value))
    endDate?: string;
}

export class QueryInfoTypeWeekly extends BaseWeeklyInfoQuery {
    @IsString()
    @ApiProperty({
        type: String,
        description: 'infoType',
    })
    infoType: InfoType;
}

export class QueryWeeklyDetail {
    @IsString()
    @ApiProperty({
        default: ProjectName.llss,
        required: false,
    })
    projectName: ProjectName = ProjectName.llss;

    // @IsDateString()
    endDate?: string;
}

