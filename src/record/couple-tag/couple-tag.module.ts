import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoupleTagService } from './couple-tag.service';
import { CoupleTagController } from './couple-tag.controller';
import { CoupleTag } from './entities/couple-tag.entity';

@Module({
    imports: [TypeOrmModule.forFeature([CoupleTag])],
    controllers: [CoupleTagController],
    providers: [CoupleTagService],
    exports: [CoupleTagService],
})
export class CoupleTagModule {}
