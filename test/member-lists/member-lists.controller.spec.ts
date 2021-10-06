import { Test, TestingModule } from '@nestjs/testing';
import { MemberListController } from '../../src/member-list/member-list.controller';
import { MemberListService } from '../../src/member-list/member-list.service';

describe('MemberListsController', () => {
    let controller: MemberListController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MemberListController],
            providers: [MemberListService],
        }).compile();

        controller = module.get<MemberListController>(MemberListController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
