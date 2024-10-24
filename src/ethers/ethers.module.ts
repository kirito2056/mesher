import { Module } from '@nestjs/common';
import { EthersController } from './ethers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EthersService } from './ethers.service';
import { Block } from './entities/block.entity';
import { Transaction } from './entities/transaction.entity';
import { Log } from './entities/log.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { SlackService } from 'src/slack/slack.service';
import { SlackConfig } from 'src/slack/slack.entity';
import { SlackConfigController } from 'src/slack/slack.controller';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Block, Transaction, Log, SlackConfig]), // SlackConfig 추가

  ],
  controllers: [EthersController, SlackConfigController],
  providers: [EthersService, SlackService],
  exports: [EthersService],
})
export class EthersModule {}
