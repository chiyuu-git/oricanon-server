import { Test, TestingModule } from '@nestjs/testing';
import { CouplePixivTagController } from '../../src/couple-pixiv-tags/couple-pixiv-tags.controller';
import { CouplePixivTagService } from '../../src/couple-pixiv-tags/couple-pixiv-tags.service';

describe('CouplePixivTagController', () => {
    let controller: CouplePixivTagController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CouplePixivTagController],
            providers: [CouplePixivTagService],
        }).compile();

        controller = module.get<CouplePixivTagController>(CouplePixivTagController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
