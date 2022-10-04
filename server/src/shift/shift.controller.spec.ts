import { Test, TestingModule } from '@nestjs/testing';
import { ShiftController } from './shift.controller';

describe('ShiftController', () => {
  let controller: ShiftController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShiftController],
    }).compile();

    controller = module.get<ShiftController>(ShiftController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
