import { PartialType } from '@nestjs/swagger';
import { CreateProjectDto } from './create-project.dto';

/**
 * PartialType 会使得 Dto 的属性全部作为可选，同时 class 可以作用与类型上下文
 * 因此，可以直接使用 UpdateProjectDto 作为 CRUD函数 的类型
 */
export class UpdateProjectDto extends PartialType(CreateProjectDto) {}
