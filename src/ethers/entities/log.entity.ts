import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Transaction } from './transaction.entity';
import { Block } from './block.entity';

@Entity({ name: 'Log' })
export class Log {
  @PrimaryGeneratedColumn()
  id: number; // 로그 고유 ID

  @Column({ type: 'varchar', length: 66 })
  transactionHash: string; // 트랜잭션 해시값

  @Column({ type: 'bigint' })
  blockNumber: number; // 블록 높이

  @Column({ type: 'int' })
  transactionIndex: number; // 로그 발생 트랜잭션의 인덱스

  @Column({ type: 'int' })
  logIndex: number; // 블록 내 전체 로그 중 해당 로그의 인덱스

  @Column({ type: 'varchar', length: 42 })
  address: string; // 이벤트 발생한 주소

  @Column({ type: 'text' })
  data: string; // 인덱싱된 이벤트 데이터 제외한 나머지 데이터

  @Column({ type: 'text'})
  topics: string; // 인덱싱된 이벤트 데이터

  @Column({ type: 'boolean', default: false})
  removed: boolean; // 블록 재구성으로 인한 로그 제거 여부

  @ManyToOne(() => Transaction, (transaction) => transaction.logs, { onDelete: 'CASCADE' })
  transaction: Transaction;

  @ManyToOne(() => Block, (block) => block.logs, { onDelete: 'CASCADE' })
  block: Block;
}
/*
0x00000000000000000000000000000000000000000000000162805b825c80277000000000000000000000000000000000000000000000000000000000000e6f680000000000000000000000000000000000000000000000000000000000030d40000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000e48431f5c1000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000530000000000000000000000000000000000000400000000000000000000000007ae8551be970cb1cca11dd7a11f47ae82e70e6700000000000000000000000007ae8551be970cb1cca11dd7a11f47ae82e70e6700000000000000000000000000000000000000000000000162805b825c80277000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
*/