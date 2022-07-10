import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonFollowerService } from './person.service';
import { PersonFollowerController } from './person.controller';
import { LLNPerson, LLSPerson, LLSSPerson } from './person.entity';
import { RecordTypeEntity } from '../common/record-type.entity';
import { RestMember } from '../common/record.entity';

@Module({
    imports: [TypeOrmModule.forFeature([RecordTypeEntity, LLSPerson, LLNPerson, LLSSPerson, RestMember])],
    controllers: [PersonFollowerController],
    providers: [PersonFollowerService],
    exports: [PersonFollowerService],
})
export class PersonFollowerModule {}
