import { Module } from '@nestjs/common';
import { RecordService } from './record.service';
import { CharacterTagModule } from './character-tag/character-tag.module';
import { CoupleTagModule } from './couple-tag/couple-tag.module';
import { SeiyuuFollowerModule } from './seiyuu-follower/seiyuu-follower.module';

@Module({
    imports: [
        CharacterTagModule,
        CoupleTagModule,
        SeiyuuFollowerModule,
    ],
    providers: [RecordService],
    exports: [RecordService],
})
export class RecordModule {}
