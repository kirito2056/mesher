import { Test, TestingModule } from '@nestjs/testing';
import { SlackConfigController } from './slack.controller';

describe('SlackController', () => {
  let controller: SlackConfigController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SlackConfigController],
    }).compile();

    controller = module.get<SlackConfigController>(SlackConfigController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
