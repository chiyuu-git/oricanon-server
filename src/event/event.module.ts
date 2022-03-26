import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupList } from '@src/member-info/entities/group.entity';
import { MemberList } from '@src/member-info/entities/member-list.entity';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { EventList } from './entities/event-list.entity';
import { SoloEvent } from './entities/solo-event.entity';
import { EventType } from './entities/event-type.entity';
import { GroupEvent } from './entities/group-event.entity';

@Module({
    imports: [TypeOrmModule.forFeature([EventList, EventType, MemberList, SoloEvent, GroupList, GroupEvent])],
    controllers: [EventController],
    providers: [EventService],
})
export class EventModule {}
