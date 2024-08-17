import { Test, TestingModule } from '@nestjs/testing';
import { StructureService } from './structure.service';

describe('StructureService', () => {
  let service: StructureService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StructureService],
    }).compile();

    service = module.get<StructureService>(StructureService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
