import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoupleTagService } from './couple-tag.service';
import { CoupleTagController } from './couple-tag.controller';
import { LLSSCouple } from './couple-tag.entity';
import { RecordTypeEntity } from '../common/record-type.entity';

@Module({
    imports: [TypeOrmModule.forFeature([RecordTypeEntity, LLSSCouple])],
    controllers: [CoupleTagController],
    providers: [CoupleTagService],
    exports: [CoupleTagService],
})
export class CoupleTagModule {}
