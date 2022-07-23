import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberInfoService } from './member-info.service';
import { MemberInfoController } from './member-info.controller';
import { Members } from './entities/member-list.entity';
import { CharaInfo } from './entities/chara-info.entity';
import { PersonInfo } from './entities/person-info.entity';
import { CoupleInfo } from './entities/couple-info.entity';
import { Group } from './entities/group.entity';
import { ProjectList } from './entities/project.entity';

// 注册为全局模块，其他模块直接使用 MemberInfoService 作为遍历的基础
@Global()
@Module({
    imports: [TypeOrmModule.forFeature([Members, Group, ProjectList, CharaInfo, PersonInfo, CoupleInfo])],
    controllers: [MemberInfoController],
    providers: [MemberInfoService],
    exports: [MemberInfoService],
})
export class MemberInfoModule {}
