import { IsDateString, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { formatDate } from 'src/utils';
import { CharacterRecordType, BasicType, InfoType, ProjectName, RecordType } from '@chiyu-bit/canon.root';
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

export class QueryIncrementRankOfTypeInRange {
    @IsString()
    basicType: BasicType;

    @IsString()
    @ApiProperty({
        // swagger 不清楚联合类型 RecordType 的基础类型是啥，所以需要显式声明
        type: String,
        default: CharacterRecordType.illust,
    })
    recordType: RecordType;

    @ApiProperty({
        required: false,
    })
    from: string;

    @ApiProperty({
        required: false,
    })
    to: string;
}
