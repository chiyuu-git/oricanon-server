import { IsString } from 'class-validator';
import { BasicType, ProjectName } from '@common/root';
import { CharaRecordType, RecordType } from '@common/record';
import { ApiProperty } from '@nestjs/swagger';

export class QueryIncrementRankOfTypeInRange {
    @IsString()
    basicType: BasicType;

    @IsString()
    @ApiProperty({
        // swagger 不清楚联合类型 RecordType 的基础类型是啥，所以需要显式声明
        type: String,
        default: CharaRecordType.illust,
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

export class QueryRelativeIncrementOfTypeInRange extends QueryIncrementRankOfTypeInRange {
    @IsString()
    projectName: ProjectName
}
