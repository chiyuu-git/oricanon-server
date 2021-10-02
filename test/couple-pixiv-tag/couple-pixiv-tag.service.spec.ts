import { Test, TestingModule } from '@nestjs/testing';
import { CouplePixivTagService } from '../../src/couple-pixiv-tags/couple-pixiv-tags.service';

describe('CouplePixivTagService', () => {
    let service: CouplePixivTagService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [CouplePixivTagService],
        }).compile();

        service = module.get<CouplePixivTagService>(CouplePixivTagService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
