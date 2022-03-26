import { IsString } from 'class-validator';
import { Category, ProjectName } from '@common/root';
import { ApiProperty } from '@nestjs/swagger';

export class QueryProjectMemberInfoDto {
    @IsString()
    category: Category;

    @IsString()
    @ApiProperty({
        default: ProjectName.llss,
    })
    projectName: ProjectName = ProjectName.llss;
}

export class QueryMemberInfoByRomaNameDto {
    @IsString()
    category: Category;

    @IsString()
    romaName: string;
}
