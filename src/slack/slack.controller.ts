import { Controller, Put, Body } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SlackConfig } from './slack.entity';

@Controller('slack-config')
export class SlackConfigController {
  constructor(
    @InjectRepository(SlackConfig)
    private readonly slackConfigRepository: Repository<SlackConfig>,
  ) {}

  @Put()
  async updateConfig(@Body() config: SlackConfig): Promise<SlackConfig> {
    const existingConfig = await this.slackConfigRepository.findOne({ where: {} }); 
    if (existingConfig) {
      // 기존 설정 업데이트
      Object.assign(existingConfig, config);
      return this.slackConfigRepository.save(existingConfig);
    } else {
      // 새로운 설정 생성
      return this.slackConfigRepository.save(config);
    }
  }
}