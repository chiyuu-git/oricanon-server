import { Module } from '@nestjs/common';
import { RecordModule } from 'src/record/record.module';
import { WeeklyService } from './weekly.service';
import { WeeklyController } from './weekly.controller';

@Module({
    imports: [RecordModule],
    controllers: [WeeklyController],
    providers: [WeeklyService],
})
export class WeeklyModule {}
