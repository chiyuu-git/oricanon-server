import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from '@src/member-info/entities/group.entity';
import { Members } from '@src/member-info/entities/member-list.entity';
import { TwitterModule } from '@src/twitter/twitter.module';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { EventList } from './entities/event-list.entity';
import { SoloEvent } from './entities/solo-event.entity';
import { EventType } from './entities/event-type.entity';
import { GroupEvent } from './entities/group-event.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([EventList, EventType, Members, SoloEvent, Group, GroupEvent]),
        TwitterModule,
    ],
    controllers: [EventController],
    providers: [EventService],
})
export class EventModule {}
