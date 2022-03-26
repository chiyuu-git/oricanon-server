import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberInfoService } from './member-info.service';
import { MemberInfoController } from './member-info.controller';
import { MemberList } from './entities/member-list.entity';
import { CharaInfo } from './entities/chara-info.entity';
import { SeiyuuInfo } from './entities/seiyuu-info.entity';
import { CoupleInfo } from './entities/couple-info.entity';
import { GroupList } from './entities/group.entity';
import { ProjectList } from './entities/project.entity';

// 注册为全局模块，其他模块直接使用 MemberInfoService 作为遍历的基础
@Global()
@Module({
    imports: [TypeOrmModule.forFeature([MemberList, GroupList, ProjectList, CharaInfo, SeiyuuInfo, CoupleInfo])],
    controllers: [MemberInfoController],
    providers: [MemberInfoService],
    exports: [MemberInfoService],
})
export class MemberInfoModule {}
