import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Block } from './entities/block.entity';
import { Transaction } from './entities/transaction.entity';
import { Log } from './entities/log.entity';
import { ethers, JsonRpcProvider } from 'ethers';
import { Cron } from '@nestjs/schedule';
import { SlackService } from 'src/slack/slack.service';

@Injectable()
export class EthersService {
  private readonly logger = new Logger(EthersService.name);
  private provider: JsonRpcProvider;

  constructor(
    @InjectRepository(Block)
    private readonly blockRepository: Repository<Block>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Log)
    private readonly logRepository: Repository<Log>,
    private readonly slackService: SlackService,
  ) { 
    this.provider = new ethers.JsonRpcProvider(`${process.env.ETHEREUM_RPC_URL}`);
   }

   
  @Cron('0 * * * * *')
  async fetchDataAndSave() {
    this.logger.log('Fetching and saving Ethereum data...');
    this.logger.log(`Ethereum RPC URL: ${process.env.ETHEREUM_RPC_URL}`);


    try {
      const latestBlockNumber = await this.provider.getBlockNumber();
      this.logger.log(`Latest block number: ${latestBlockNumber}`);

      for (let i = latestBlockNumber; i > latestBlockNumber; i--) {
        const blockData = await this.provider.getBlock(i);
        const transactions = await Promise.all(
          blockData.transactions.map((txHash) => this.provider.getTransaction(txHash))
        );


        const blockEntity = new Block();
        blockEntity.hash = blockData.hash;
        blockEntity.parentHash = blockData.parentHash;
        blockEntity.number = blockData.number;
        blockEntity.timestamp = blockData.timestamp;
        blockEntity.nonce = blockData.nonce;
        blockEntity.difficulty = blockData.difficulty.toString();
        blockEntity.gasLimit = blockData.gasLimit.toString();
        blockEntity.gasUsed = blockData.gasUsed.toString();
        blockEntity.miner = blockData.miner;
        blockEntity.extraData = blockData.extraData;
        await this.blockRepository.save(blockEntity);

        for (const tx of transactions) {
          const receipt = await this.provider.getTransactionReceipt(tx.hash);

          const transactionEntity = new Transaction();
          transactionEntity.hash = tx.hash;
          transactionEntity.blockNumber = tx.blockNumber;
          transactionEntity.transactionIndex = tx.index;
          transactionEntity.from = tx.from;
          transactionEntity.to = tx.to;
          transactionEntity.contractAddress = receipt.contractAddress || null;
          transactionEntity.gasUsed = receipt.gasUsed.toString();
          transactionEntity.effectiveGasPrice = tx.gasPrice?.toString() || '0';
          transactionEntity.logsBloom = receipt.logsBloom;
          transactionEntity.cumulativeGasUsed = receipt.cumulativeGasUsed.toString();
          transactionEntity.status = receipt.status ? 1 : 0;
          transactionEntity.block = blockEntity;

          await this.transactionRepository.save(transactionEntity);

          for (const logData of receipt.logs) {
            const logEntity = new Log();
            logEntity.transactionHash = logData.transactionHash;
            logEntity.blockNumber = logData.blockNumber;
            logEntity.transactionIndex = logData.transactionIndex;
            logEntity.logIndex = logData.index;
            logEntity.address = logData.address;
            logEntity.data = logData.data;
            logEntity.topics = logData.topics.join(','); 
            logEntity.removed = logData.removed;
            logEntity.transaction = transactionEntity;
            logEntity.block = blockEntity;

            await this.logRepository.save(logEntity);
          }
        }
      }

      this.logger.log('Ethereum data fetched and saved successfully.');
    } catch (error) {
      this.logger.error('Error fetching and saving data:', error);
    }
  }

  async findBlockByHash(hash: string): Promise<Block | undefined> {
    try {         
      const block = await this.blockRepository.findOne({
        where: { hash },
          relations: ['transactions', 'transactions.logs'], 
          });
    
        if (!block) {
          this.logger.warn(`Block with hash ${hash} not found.`);
          return undefined;
        }
        this.logger.log('success');
    
        return block;
      } catch (error) {
          this.logger.error(`Error finding block by hash: ${error.message}`);
          throw error;
      }
    }
    
  async findTransactionByHash(hash: string): Promise<Transaction | undefined> {
    try {
      const transaction = await this.transactionRepository.findOne({
        where: { hash },
          relations: ['logs'],
      });
    
    if (!transaction) {
        this.logger.warn(`Transaction with hash ${hash} not found`);
        return undefined;
    }
    
    this.logger.log('Transaction found successfully');
    return transaction;
    } catch (error) {
      this.logger.error(`Error finding transaction by hash: ${error.message}`);
        throw error;
    }
  }
    
  async findTransactionsByAddress(
    fromAddress?: string, 
    toAddress?: string,
  ): Promise<Transaction[]> {
    const queryBuilder = this.transactionRepository.createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.logs', 'logs'); // logs 조인은 한 번에 추가
      
    if (fromAddress) {
      queryBuilder.where('transaction.from = :fromAddress', { fromAddress });
    }
      
    if (toAddress) {
      queryBuilder.andWhere('transaction.to = :toAddress', { toAddress });
    }
      
    return queryBuilder.getMany();    
  }


  // ---------Slack Service---------

  @Cron('*/5 * * * *')
  async reportDatabaseStatus() {
    await this.slackService.reportDatabaseStatus();
  }

  async handleError(error: Error) {
    await this.slackService.reportError(error);
  }

  @Cron('0 * * * *')
  async reportServerStatus() {
    await this.slackService.reportServerStatus();
  }

  // ---------Slack Service---------

/*
  ----------개인적으로 추가한 기능----------
*/

async findAllBlockHashesWithTimestamp(): Promise<BlockHashTime[]> {
  try {
    const blocks = await this.blockRepository.find({
      select: ['hash', 'timestamp'],
      order: { number: 'DESC' },
    });

    const blockHashTime = blocks.map((block) => ({
      hash: block.hash,
      timestamp: new Date(block.timestamp * 1000).toLocaleString(), 
    }));

    return blockHashTime;
  } catch (error) {
      this.logger.error('Error finding block hashes with timestamps:', error);
      throw error;
    }
  }

  async findAllTransactionHashesWithTimestamp(): Promise<TransactionHashTime[]> {
    try {
      const transactions = await this.transactionRepository.find({
        select: ['hash', 'block'],
        relations: ['block'],
        order: { blockNumber: 'DESC', transactionIndex: 'DESC' }, 
      });
  
      const transactionHashTimes = transactions.map((transaction) => ({
        hash: transaction.hash,
        timestamp: new Date(transaction.block.timestamp * 1000).toLocaleString(),
      }));
  
      return transactionHashTimes;
    } catch (error) {
      this.logger.error('Error finding transaction hashes with timestamps:', error);
      throw error;
    }
  }
}



export interface BlockHashTime {
  hash: string;
  timestamp: string;
}

export interface TransactionHashTime {
  hash: string;
  timestamp: string;
}
/*
  ----------개인적으로 추가한 기능----------
*/