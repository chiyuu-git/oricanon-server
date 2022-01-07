import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CharacterTagService } from './character-tag.service';
import { CharacterTagController } from './character-tag.controller';
import { LLChara, LLNChara, LLSChara, LLSSChara } from './character-tag.entity';
import { RecordTypeEntity } from '../common/record-type.entity';

@Module({
    imports: [TypeOrmModule.forFeature([
        RecordTypeEntity,
        LLChara,
        LLSChara,
        LLNChara,
        LLSSChara,
    ])],
    controllers: [CharacterTagController],
    providers: [CharacterTagService],
    exports: [CharacterTagService],
})
export class CharacterTagModule {}
