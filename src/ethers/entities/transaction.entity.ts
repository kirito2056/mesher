import { Entity, Column, PrimaryColumn, ManyToOne, OneToMany } from 'typeorm';
import { Block } from './block.entity';
import { Log } from './log.entity';

@Entity({ name: 'Transaction' })
export class Transaction {
  @PrimaryColumn({ type: 'varchar', length: 66 })
  hash: string; // 해시값

  @Column({ type: 'bigint' })
  blockNumber: number; // 블록 번호

  @Column({ type: 'int' })
  transactionIndex: number; // 블록 내 트랜잭션 순서

  @Column({ type: 'varchar', length: 42, nullable: true })
  from: string; // 송신자 주소

  @Column({ type: 'varchar', length: 42, nullable: true })
  to: string; // 수신자 주소

  @Column({ type: 'varchar', length: 42, nullable: true })
  contractAddress: string; // 사용된 컨트랙트 주소, 컨트랙트 배포일 경우에만

  @Column({ type: 'varchar', length: 255, nullable: true })
  gasUsed: string; // 사용된 gas량

  @Column({ type: 'bigint', nullable: true })
  effectiveGasPrice: string; // 실제 gas 가격

  @Column({ type: 'text', nullable: true })
  logsBloom: string; // 로그 데이터의 블룸 필터

  @Column({ type: 'varchar', length: 255, nullable: true })
  cumulativeGasUsed: string; // 트랜잭션 완료까지 누적된 가스 사용량

  @Column({ type: 'int' })
  status: number; // 트랜잭션 상태(1: 성공, 0: 실패)

  @ManyToOne(() => Block, (block) => block.transactions, { onDelete: 'CASCADE' })
  block: Block; // 외래 키로 설정된 block

  @OneToMany(() => Log, (log) => log.transaction, { cascade: true })
  logs: Log[];
}
