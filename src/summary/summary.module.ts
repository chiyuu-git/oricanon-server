import { Module } from '@nestjs/common';
import { RecordModule } from 'src/record/record.module';
import { SummaryService } from './summary.service';
import { SummaryController } from './summary.controller';

@Module({
    imports: [RecordModule],
    controllers: [SummaryController],
    providers: [SummaryService],
})
export class SummaryModule {}
