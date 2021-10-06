import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouplePixivTagService } from './couple-pixiv-tag.service';
import { CouplePixivTagController } from './couple-pixiv-tag.controller';
import { CouplePixivTag } from './entities/couple-pixiv-tag.entity';

@Module({
    imports: [TypeOrmModule.forFeature([CouplePixivTag])],
    controllers: [CouplePixivTagController],
    providers: [CouplePixivTagService],
    exports: [CouplePixivTagService],
})
export class CouplePixivTagModule {}
