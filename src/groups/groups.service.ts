import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group } from './entities/group.entity';
import { groupName } from './groups.type';

@Injectable()
export class GroupsService {
    constructor(
        @InjectRepository(Group)
        private groupsRepository: Repository<Group>,
    ) {}

    async create(createGroupDto: CreateGroupDto) {
        const newGroup = await this.groupsRepository.insert(createGroupDto);
        console.log('createNewGroup:', newGroup);
        // const newGroup = await this.groupsRepository.create(createGroupDto);
        // const test = this.groupsRepository.merge(newGroup, {
        // 	members: ['honoka', 'kotori'],
        // });
        // console.log('test: ', test);
        // await this.groupsRepository.save(newGroup);
        return 'This action adds a new group';
    }

    async findAll() {
        const group = await this.groupsRepository.find();
        console.log('group:', group);
        return `This action returns all groups`;
    }

    async findOne(groupName: groupName) {
        const group = await this.groupsRepository.findOne(groupName);
        return `This action returns a #${JSON.stringify(group)} group`;
    }

    async update(groupName: groupName, updateGroupDto: UpdateGroupDto) {
        await this.groupsRepository.update(groupName, updateGroupDto);
        // 执行 UPDATE user SET firstName = Rizzrak WHERE firstName = Timber
        return `This action updates a #${groupName} group`;
    }

    // async remove(groupName: groupName) {
    //     // 添加废除标记
    //     const updateGroupDto = {};
    //     await this.groupsRepository.update(groupName);
    //     return `This action removes a #${groupName} group`;
    // }
}
