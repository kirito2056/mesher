import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class SlackConfig {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: 'xoxb-7922275237286-7922295515558-Rzuj1nBxg8Ll9BzMteWzO82r'})
    slackToken: string;

    @Column({default: ''})
    slackChannelId: string
}