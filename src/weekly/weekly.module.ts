import { Module } from '@nestjs/common';
import { CoupleTagModule } from 'src/couple-tag/couple-tag.module';
import { CharacterTagModule } from 'src/character-tag/character-tag.module';
import { SeiyuuFollowerModule } from 'src/seiyuu-follower/seiyuu-follower.module';
import { WeeklyService } from './weekly.service';
import { WeeklyController } from './weekly.controller';

@Module({
    imports: [CoupleTagModule, CharacterTagModule, SeiyuuFollowerModule],
    controllers: [WeeklyController],
    providers: [WeeklyService],
})
export class WeeklyModule {}
