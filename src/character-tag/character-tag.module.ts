import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CharacterTagService } from './character-tag.service';
import { CharacterTagController } from './character-tag.controller';
import { CharacterTag } from './entities/character-tag.entity';

@Module({
    imports: [TypeOrmModule.forFeature([CharacterTag])],
    controllers: [CharacterTagController],
    providers: [CharacterTagService],
    exports: [CharacterTagService],
})
export class CharacterTagModule {}
