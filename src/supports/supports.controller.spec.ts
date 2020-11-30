import { Test, TestingModule } from '@nestjs/testing';
import { SupportsController } from './supports.controller';

describe('Supports Controller', () => {
  let controller: SupportsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupportsController],
    }).compile();

    controller = module.get<SupportsController>(SupportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
