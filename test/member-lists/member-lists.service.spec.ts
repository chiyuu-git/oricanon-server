import { Test, TestingModule } from '@nestjs/testing';
import { MemberListService } from '../../src/member-list/member-list.service';

describe('MemberListsService', () => {
    let service: MemberListService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [MemberListService],
        }).compile();

        service = module.get<MemberListService>(MemberListService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
