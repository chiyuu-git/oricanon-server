import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberList } from './entities/member-list.entity';
import { MemberListsService } from './member-lists.service';
import { MemberListsController } from './member-lists.controller';

@Module({
    imports: [TypeOrmModule.forFeature([MemberList])],
    controllers: [MemberListsController],
    providers: [MemberListsService],
})
export class MemberListsModule {}
