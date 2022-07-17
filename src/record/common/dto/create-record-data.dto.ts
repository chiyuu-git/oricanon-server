import { IsArray, IsBoolean, IsDateString, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { formatDate } from '@utils/date';
import { Category, ProjectName } from '@common/root';
import { RecordType } from '@common/record';
import { transformToBoolean } from '@utils/transform';

export class CreateRecordOfProjectDto {
    @IsString()
    projectName: ProjectName;

    @IsString()
    recordType: RecordType;

    /**
     * 输入数组的正确姿势： "[1, 2, 3]"
     * 要用引号包裹，元素不能换行
     */
    @IsArray()
    @Transform(({ value }) => JSON.parse(value))
    records: number[];

    @IsDateString()
    @Transform(({ value }) => formatDate(value))
    date: string;

    @Transform(transformToBoolean)
    onlyActive = true;
}

