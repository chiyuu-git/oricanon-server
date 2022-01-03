import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeiyuuFollowerService } from './seiyuu-follower.service';
import { SeiyuuFollowerController } from './seiyuu-follower.controller';
import { LLNSeiyuu, LLSSeiyuu, LLSSSeiyuu, SeiyuuFollower } from './entities/seiyuu-follower.entity';
import { RecordTypeEntity } from '../common/record-type.entity';

@Module({
    imports: [TypeOrmModule.forFeature([SeiyuuFollower, RecordTypeEntity, LLSSeiyuu, LLNSeiyuu, LLSSSeiyuu])],
    controllers: [SeiyuuFollowerController],
    providers: [SeiyuuFollowerService],
    exports: [SeiyuuFollowerService],
})
export class SeiyuuFollowerModule {}
