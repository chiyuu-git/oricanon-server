import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from '../../src/projects/projects.controller';
import { ProjectsService } from '../../src/projects/projects.service';

describe('ProjectsController', () => {
    let controller: ProjectsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProjectsController],
            providers: [ProjectsService],
        }).compile();

        controller = module.get<ProjectsController>(ProjectsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
