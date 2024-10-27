import { Test, TestingModule } from '@nestjs/testing';
import { ReinforcementService } from './reinforcement.service';

describe('ReinforcementService', () => {
  let service: ReinforcementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReinforcementService],
    }).compile();

    service = module.get<ReinforcementService>(ReinforcementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
