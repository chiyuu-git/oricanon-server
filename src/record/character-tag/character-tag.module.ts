import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CharacterTagService } from './character-tag.service';
import { CharacterTagController } from './character-tag.controller';
import { CharacterTag, LLChara, LLNChara, LLSChara, LLSSChara } from './entities/character-tag.entity';
import { RecordType } from '../common/record-type.entity';

@Module({
    imports: [TypeOrmModule.forFeature([
        CharacterTag,
        RecordType,
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
