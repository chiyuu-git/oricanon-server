import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CharaTagService } from './chara-tag.service';
import { CharaTagController } from './chara-tag.controller';
import { LLChara, LLNChara, LLSChara, LLSSChara } from './chara-tag.entity';
import { RecordTypeEntity } from '../common/record-type.entity';
import { RestMember } from '../common/record.entity';

@Module({
    imports: [TypeOrmModule.forFeature([
        RecordTypeEntity,
        LLChara,
        LLSChara,
        LLNChara,
        LLSSChara,
        RestMember,
    ])],
    controllers: [CharaTagController],
    providers: [CharaTagService],
    exports: [CharaTagService],
})
export class CharaTagModule {}
