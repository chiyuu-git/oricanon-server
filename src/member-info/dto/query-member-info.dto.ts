import { IsString } from 'class-validator';
import { BasicType, ProjectName } from '@common/root';
import { ApiProperty } from '@nestjs/swagger';

export class QueryMemberInfo {
    @IsString()
    basicType: BasicType;

    @IsString()
    @ApiProperty({
        default: ProjectName.llss,
    })
    projectName: ProjectName = ProjectName.llss;
}