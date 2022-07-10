import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventTypeEnum } from '@common/event-list';
import { TWITTER_HOST } from '@common/twitter';
import { Group } from '@src/member-info/entities/group.entity';
import { MemberList } from '@src/member-info/entities/member-list.entity';
import { Repository } from 'typeorm';
import { ArticleService } from '@src/twitter/twitter.service';
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

    @InjectRepository(Group)
    GroupRepository: Repository<Group>;

    @InjectRepository(GroupEvent)
    GroupEventRepository: Repository<GroupEvent>;

    constructor(
        private readonly articleService: ArticleService,
    ) {}

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
        const groupEntity = await this.GroupRepository.findOne({
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

    /**
     * 处理推特链接，关联推文和事件
     * 返回推特以外的链接
     */
    async handleRelativeTwitterArticle(relativeUrlList: string[], eventId: number) {
        return relativeUrlList.map((url) => {
            console.log('url:', url);
            if (url.startsWith(TWITTER_HOST)) {
                this.articleService.updateArticleEventId(url, eventId);
                return '';
            }
            return url;
        }).filter((url) => url);
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

        if (relativeUrlList && relativeUrlList.length > 0) {
            eventRecordEntity.relativeUrlList = await this.handleRelativeTwitterArticle(
                relativeUrlList,
                eventRecordEntity.eventId,
            );
        }

        await this.EventListRepository.save(eventRecordEntity);

        return eventRecordEntity;
    }

    async createGroupEvent(createGroupEventDto: CreateGroupEventDto) {
        const { groupList } = createGroupEventDto;
        console.log('groupList:', groupList);

        const [{ eventId }, ...groupEntityList] = await Promise.all([
            this.createEventRecord(createGroupEventDto),
            ...groupList.map((groupRomaName) => this.getGroupEntity(groupRomaName)),
        ]);

        for (const { groupId } of groupEntityList) {
            this.GroupEventRepository.insert({
                eventId,
                groupId,
            });
        }

        return 'This action adds new group event';
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

