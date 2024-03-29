import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EventService } from './event.service';
import { CreateGroupEventDto, CreateSoloEventDto } from './dto/create-event.dto';
import { UpdateGroupEventDto } from './dto/update-event.dto';

@ApiTags('event')
@Controller('event')
export class EventController {
    constructor(private readonly eventService: EventService) {}

    /**
     * post 方法，使用 Query 参数，方便填写表单
     * client 的 fetch 无法处理这种情况
     */
    @Post('/create_group_event')
    createGroupEvent(@Query() createGroupEventDto: CreateGroupEventDto) {
        return this.eventService.createGroupEvent(createGroupEventDto);
    }

    /**
     * post 方法，使用 Query 参数，方便填写表单
     * client 的 fetch 无法处理这种情况
     */
    @Post('/create_solo_event')
    createSoloEvent(@Query() createSoloEventDto: CreateSoloEventDto) {
        return this.eventService.createSoloEvent(createSoloEventDto);
    }
}
