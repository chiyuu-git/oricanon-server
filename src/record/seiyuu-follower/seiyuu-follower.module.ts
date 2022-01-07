import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeiyuuFollowerService } from './seiyuu-follower.service';
import { SeiyuuFollowerController } from './seiyuu-follower.controller';
import { LLNSeiyuu, LLSSeiyuu, LLSSSeiyuu } from './seiyuu-follower.entity';
import { RecordTypeEntity } from '../common/record-type.entity';

@Module({
    imports: [TypeOrmModule.forFeature([RecordTypeEntity, LLSSeiyuu, LLNSeiyuu, LLSSSeiyuu])],
    controllers: [SeiyuuFollowerController],
    providers: [SeiyuuFollowerService],
    exports: [SeiyuuFollowerService],
})
export class SeiyuuFollowerModule {}
