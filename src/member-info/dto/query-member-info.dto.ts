import { IsString } from 'class-validator';
import { Category, ProjectName } from '@common/root';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { transformToBoolean } from '@utils/transform';

export class QueryMemberListOfCategoryDto {
    @IsString()
    category: Category;

    @ApiProperty({
        default: true,
    })

    @Transform(transformToBoolean)
    onlyActive = true;
}
export class QueryProjectMemberListDto extends QueryMemberListOfCategoryDto {
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
