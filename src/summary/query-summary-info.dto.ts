import { IsString } from 'class-validator';
import { CharacterRecordType, BasicType, ProjectName, RecordType } from '@chiyu-bit/canon.root';
import { ApiProperty } from '@nestjs/swagger';

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

export class QueryRelativeIncrementOfTypeInRange extends QueryIncrementRankOfTypeInRange {
    @IsString()
    projectName: ProjectName
}
