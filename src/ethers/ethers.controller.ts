import { Controller, Get, Param, Query } from '@nestjs/common';
import { Block } from './entities/block.entity';
import { Transaction } from './entities/transaction.entity';
import { EthersService, BlockHashTime, TransactionHashTime } from './ethers.service';

@Controller('ethers')
export class EthersController {
  constructor(
    private readonly ethersService: EthersService,
  ) {}

  @Get('fetch')
  async fetchData() {
      await this.ethersService.fetchDataAndSave();
      return { message: 'Data fetched successfully' };
  }

  @Get('blocks/:hash')
  async getBlockByHash(@Param('hash') hash: string): Promise<Block> {
    return this.ethersService.findBlockByHash(hash);
  }

  @Get('transactions/:hash')
  async getTransactionByHash(@Param('hash') hash: string): Promise<Transaction> {
    return this.ethersService.findTransactionByHash(hash);
  }

  @Get('transactions')
  async getTransactionsByAddress(
    @Query('from') fromAddress?: string,
    @Query('to') toAddress?: string,
  ): Promise<Transaction[]> {
    return this.ethersService.findTransactionsByAddress(fromAddress, toAddress);
  }

  @Get('blockhashlist')
async getBlockHashesWithTimestamp(): Promise<BlockHashTime[]> {
  return this.ethersService.findAllBlockHashesWithTimestamp();
}

@Get('transactionlist') // 엔드포인트 경로
async getTransactionHashesWithTimestamp(): Promise<TransactionHashTime[]> {
  return this.ethersService.findAllTransactionHashesWithTimestamp();
}
}
