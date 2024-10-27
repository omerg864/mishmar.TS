import { Test, TestingModule } from '@nestjs/testing';
import { ReinforcementController } from './reinforcement.controller';

describe('ReinforcementController', () => {
  let controller: ReinforcementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReinforcementController],
    }).compile();

    controller = module.get<ReinforcementController>(ReinforcementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
