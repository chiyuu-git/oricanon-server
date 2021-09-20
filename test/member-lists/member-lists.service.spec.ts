import { Test, TestingModule } from '@nestjs/testing';
import { MemberListsService } from '../../src/member-lists/member-lists.service';

describe('MemberListsService', () => {
    let service: MemberListsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [MemberListsService],
        }).compile();

        service = module.get<MemberListsService>(MemberListsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
