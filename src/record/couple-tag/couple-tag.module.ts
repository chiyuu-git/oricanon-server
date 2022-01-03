import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoupleTagService } from './couple-tag.service';
import { CoupleTagController } from './couple-tag.controller';
import { CoupleTag, LLSSCouple } from './entities/couple-tag.entity';
import { RecordTypeEntity } from '../common/record-type.entity';

@Module({
    imports: [TypeOrmModule.forFeature([CoupleTag, RecordTypeEntity, LLSSCouple])],
    controllers: [CoupleTagController],
    providers: [CoupleTagService],
    exports: [CoupleTagService],
})
export class CoupleTagModule {}
