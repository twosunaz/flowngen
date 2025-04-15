/* eslint-disable */
import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { IUpsertHistory } from '../../Interface'
import { User } from './User'

@Entity()
export class UpsertHistory implements IUpsertHistory {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Index()
    @Column()
    chatflowid: string

    @Column()
    result: string

    @Column()
    flowData: string

    @CreateDateColumn()
    date: Date

    // 🔐 Multi-tenancy: associate upsert history with user
    @Column({ type: 'uuid' })
    userId: string

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User
}
