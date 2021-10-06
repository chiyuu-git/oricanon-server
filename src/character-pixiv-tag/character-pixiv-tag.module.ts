import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CharacterPixivTagService } from './character-pixiv-tag.service';
import { CharacterPixivTagController } from './character-pixiv-tag.controller';
import { CharacterPixivTag } from './entities/character-pixiv-tag.entity';

@Module({
    imports: [TypeOrmModule.forFeature([CharacterPixivTag])],
    controllers: [CharacterPixivTagController],
    providers: [CharacterPixivTagService],
    exports: [CharacterPixivTagService],
})
export class CharacterPixivTagModule {}
