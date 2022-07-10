import { Module } from '@nestjs/common';
import { RecordService } from './record.service';
import { CharaTagModule } from './chara-tag/chara-tag.module';
import { CoupleTagModule } from './couple-tag/couple-tag.module';
import { PersonFollowerModule } from './person/person.module';

@Module({
    imports: [
        CharaTagModule,
        CoupleTagModule,
        PersonFollowerModule,
    ],
    providers: [RecordService],
    exports: [RecordService],
})
export class RecordModule {}
