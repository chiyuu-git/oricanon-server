import { Test, TestingModule } from '@nestjs/testing';
import { MemberListsController } from '../../src/member-lists/member-lists.controller';
import { MemberListsService } from '../../src/member-lists/member-lists.service';

describe('MemberListsController', () => {
    let controller: MemberListsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MemberListsController],
            providers: [MemberListsService],
        }).compile();

        controller = module.get<MemberListsController>(MemberListsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
