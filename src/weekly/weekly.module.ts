import { Module } from '@nestjs/common';
import { CouplePixivTagModule } from 'src/couple-pixiv-tag/couple-pixiv-tag.module';
import { WeeklyService } from './weekly.service';
import { WeeklyController } from './weekly.controller';

@Module({
    imports: [CouplePixivTagModule],
    controllers: [WeeklyController],
    providers: [WeeklyService],
})
export class WeeklyModule {}
