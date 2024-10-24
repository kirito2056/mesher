import { Injectable, Logger } from '@nestjs/common';
import { App, LogLevel } from '@slack/bolt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Block } from '../ethers/entities/block.entity';
import { Transaction } from 'src/ethers/entities/transaction.entity';
import { Log } from 'src/ethers/entities/log.entity';
import { SlackConfig } from './slack.entity';

@Injectable()
export class SlackService {
  private readonly logger = new Logger(SlackService.name);
  private slackApp: App;

  constructor(
    @InjectRepository(SlackConfig)
    private readonly slackConfigRepository: Repository<SlackConfig>,
    private configService: ConfigService,
    @InjectRepository(Block)
    private readonly blockRepository: Repository<Block>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Log)
    private readonly logRepository: Repository<Log>,
  ) {
  this.loadSlackConfig();
    
  }

  private async loadSlackConfig() {
    try {
      const slackConfig = await this.slackConfigRepository.findOne({ where: {} });
      if (slackConfig) {
        this.slackApp = new App({
          token: slackConfig.slackToken, // 필드명 수정
          signingSecret: this.configService.get('SLACK_SIGNING_SECRET'),
          logLevel: LogLevel.DEBUG,
        });
      } else {
        this.logger.warn('Slack configuration not found in database.');
      }
    } catch (error) {
      this.logger.error(`Failed to load Slack configuration: ${error.message}`);
    }
  }

  async sendMessage(message: string) {
    try {
      await this.loadSlackConfig(); // sendMessage() 호출 시 설정 로드
  
      const slackConfig = await this.slackConfigRepository.findOne({ where: {} });
      if (slackConfig && this.slackApp) { // slackApp 존재 여부 확인
        await this.slackApp.client.chat.postMessage({
          channel: slackConfig.slackChannelId,
          text: message,
        });
      } else {
        this.logger.warn('Slack configuration not found or slackApp not initialized.');
      }
    } catch (error) {
      this.logger.error(`Failed to send Slack message: ${error.message}`);
    }
  }

  async reportDatabaseStatus() {
    const blockCount = await this.blockRepository.count();
    const transactionCount = await this.transactionRepository.count();
    const logCount = await this.logRepository.count();

    const message = `
    Database Status:
    - Blocks: ${blockCount}
    - Transactions: ${transactionCount}
    - Logs: ${logCount}
    `;

    await this.sendMessage(message);
  }

  async reportError(error: Error) {
    const message = `
    Error occurred:
    - Message: ${error.message}
    - Stack: ${error.stack}
    `;

    await this.sendMessage(message);
  }

  async reportServerStatus() {
    const message = `Server is running normally.`;
    await this.sendMessage(message);
  }
}