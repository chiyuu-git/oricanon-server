import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeiyuuFollowerService } from './seiyuu-follower.service';
import { SeiyuuFollowerController } from './seiyuu-follower.controller';
import { SeiyuuFollower } from './entities/seiyuu-follower.entity';

@Module({
    imports: [TypeOrmModule.forFeature([SeiyuuFollower])],
    controllers: [SeiyuuFollowerController],
    providers: [SeiyuuFollowerService],
    exports: [SeiyuuFollowerService],
})
export class SeiyuuFollowerModule {}
