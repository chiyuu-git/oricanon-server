import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberInfoService } from './member-info.service';
import { MemberInfoController } from './member-info.controller';
import { CharaInfo } from './entities/chara-info.entity';
import { SeiyuuInfo } from './entities/seiyuu-info.entity';
import { CoupleInfo } from './entities/couple-info.entity';

@Module({
    imports: [TypeOrmModule.forFeature([CharaInfo, SeiyuuInfo, CoupleInfo])],
    controllers: [MemberInfoController],
    providers: [MemberInfoService],
})
export class MemberInfoModule {}
