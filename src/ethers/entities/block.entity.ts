import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Transaction } from './transaction.entity';
import { Log } from './log.entity';

@Entity({ name: 'Blocks' })
export class Block {
  @PrimaryColumn({ type: 'varchar', length: 66 })
  hash: string; // 해시값

  @Column({ type: 'varchar', length: 66, nullable: true })
  parentHash: string; // 이전 블록 해시값, 블록 높이 0인 경우 NULL

  @Column({ type: 'bigint' })
  number: number; // 블록 높이

  @Column({ type: 'bigint' })
  timestamp: number; // UNIX TIMESTAMP

  @Column({ type: 'varchar', length: 255, nullable: true })
  nonce: string; // 작업 증명에 사용된 난수값

  @Column({ type: 'varchar', length: 255, nullable: true })
  difficulty: string; // 블록 채굴 난이도

  @Column({ type: 'varchar', length: 255, nullable: true })
  gasLimit: string; // 최대 gas량

  @Column({ type: 'varchar', length: 255, nullable: true })
  gasUsed: string; // 사용된 gas량

  @Column({ type: 'varchar', length: 42, nullable: true })
  miner: string; // 채굴자 주소

  @Column({ type: 'varchar', length: 255, nullable: true })
  extraData: string; // 추가적인 데이터

  @OneToMany(() => Transaction, (transaction) => transaction.block, { cascade: true })
  transactions: Transaction[];

  @OneToMany(() => Log, (log) => log.block, { cascade: true })
  logs: Log[];
}