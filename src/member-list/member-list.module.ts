import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberList } from './entities/member-list.entity';
import { MemberListService } from './member-list.service';
import { MemberListController } from './member-list.controller';

// 注册为全局模块，其他模块直接使用 MemberListService 作为遍历的基础
@Global()
@Module({
    imports: [TypeOrmModule.forFeature([MemberList])],
    controllers: [MemberListController],
    providers: [MemberListService],
    exports: [MemberListService],
})
export class MemberListModule {}
