import { IsString } from 'class-validator';
import { Category, ProjectName } from '@common/root';
import { RecordType } from '@common/record';
import { ApiProperty } from '@nestjs/swagger';

abstract class BaseWeeklyInfoQuery {
    @IsString()
    category: Category;

    // TODO: custom validator
    // @IsDateString()
    // @Transform(({ value }) => formatDate(value))
    endDate?: string;
}

export class QueryRecordTypeWeekly extends BaseWeeklyInfoQuery {
    @IsString()
    @ApiProperty({
        type: String,
        description: 'infoType',
    })
    recordType: RecordType;
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

