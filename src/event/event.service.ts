import { EventTypeEnum } from '@common/event-list';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupList } from '@src/member-info/entities/group.entity';
import { MemberList } from '@src/member-info/entities/member-list.entity';
import { Repository } from 'typeorm';
import { CreateEventRecordDto, CreateGroupEventDto, CreateSoloEventDto } from './dto/create-event.dto';
import { UpdateGroupEventDto } from './dto/update-event.dto';
import { EventList } from './entities/event-list.entity';
import { EventType } from './entities/event-type.entity';
import { GroupEvent } from './entities/group-event.entity';
import { SoloEvent } from './entities/solo-event.entity';

@Injectable()
export class EventService {
    @InjectRepository(EventType)
    EventTypeRepository: Repository<EventType>;

    @InjectRepository(EventList)
    EventListRepository: Repository<EventList>;

    @InjectRepository(MemberList)
    MemberListRepository: Repository<MemberList>;

    @InjectRepository(SoloEvent)
    SoloEventRepository: Repository<SoloEvent>;

    @InjectRepository(GroupList)
    GroupListRepository: Repository<GroupList>;

    @InjectRepository(GroupEvent)
    GroupEventRepository: Repository<GroupEvent>;

    async getMemberEntity(romaName: string) {
        const memberEntity = await this.MemberListRepository.findOne({
            romaName,
        });

        if (!memberEntity) {
            throw new HttpException(
                `member roma name ${romaName} is illegal`,
                HttpStatus.FORBIDDEN,
            );
        }

        return memberEntity;
    }

    async getGroupEntity(romaName: string) {
        const groupEntity = await this.GroupListRepository.findOne({
            romaName,
        });

        if (!groupEntity) {
            throw new HttpException(
                `group roma name ${romaName} is illegal`,
                HttpStatus.FORBIDDEN,
            );
        }

        return groupEntity;
    }

    async getEventTypeEntity(type: EventTypeEnum) {
        // 查询 eventType 实体
        const eventTypeEntity = await this.EventTypeRepository.findOne({ name: type });
        if (!eventTypeEntity) {
            throw new HttpException(
                `event type ${type} is illegal`,
                HttpStatus.FORBIDDEN,
            );
        }

        return eventTypeEntity;
    }

    async createEventRecord(createEventDto: CreateEventRecordDto) {
        const {
            type,
            from, to,
            title,
            content,
            relativeUrlList,
            remark,
            overridePriority,
        } = createEventDto;

        const { typeId } = await this.getEventTypeEntity(type);

        const eventRecordEntity = this.EventListRepository.create({
            typeId,
            from,
            to,
            title,
            content,
            relativeUrlList,
            remark,
            overridePriority,
        });

        await this.EventListRepository.save(eventRecordEntity);

        return eventRecordEntity;
    }

    async createGroupEvent(createGroupEventDto: CreateGroupEventDto) {
        const { romaName, absentMemberList } = createGroupEventDto;

        const [{ eventId }, { groupId }] = await Promise.all([
            this.createEventRecord(createGroupEventDto),
            this.getGroupEntity(romaName),
        ]);

        this.GroupEventRepository.insert({
            eventId,
            groupId,
            absentMemberList,
        });

        return 'This action adds a new group event';
    }

    async createSoloEvent(createSoloEventDto: CreateSoloEventDto) {
        const { romaName } = createSoloEventDto;

        const [{ eventId }, { memberId }] = await Promise.all([
            this.createEventRecord(createSoloEventDto),
            this.getMemberEntity(romaName),
        ]);

        this.SoloEventRepository.insert({
            eventId,
            memberId,
        });

        return 'This action adds a new solo event';
    }

    findOne(id: number) {
        return `This action returns a #${id} event`;
    }

    update(id: number, updateEventDto: UpdateGroupEventDto) {
        return `This action updates a #${id} event`;
    }

    remove(id: number) {
        return `This action removes a #${id} event`;
    }
}
