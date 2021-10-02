import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouplePixivTagService } from './couple-pixiv-tags.service';
import { CouplePixivTagController } from './couple-pixiv-tags.controller';
import { CouplePixivTag } from './entities/couple-pixiv-tag.entity';

@Module({
    imports: [TypeOrmModule.forFeature([CouplePixivTag])],
    controllers: [CouplePixivTagController],
    providers: [CouplePixivTagService],
})
export class CouplePixivTagModule {}
