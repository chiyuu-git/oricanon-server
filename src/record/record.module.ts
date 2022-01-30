import { Module } from '@nestjs/common';
import { RecordService } from './record.service';
import { CharaTagModule } from './chara-tag/chara-tag.module';
import { CoupleTagModule } from './couple-tag/couple-tag.module';
import { SeiyuuFollowerModule } from './seiyuu-follower/seiyuu-follower.module';

@Module({
    imports: [
        CharaTagModule,
        CoupleTagModule,
        SeiyuuFollowerModule,
    ],
    providers: [RecordService],
    exports: [RecordService],
})
export class RecordModule {}
