import { Test, TestingModule } from '@nestjs/testing';
import { UserSettingsController } from './user-settings.controller';

describe('UserSettings Controller', () => {
  let controller: UserSettingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserSettingsController],
    }).compile();

    controller = module.get<UserSettingsController>(UserSettingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
