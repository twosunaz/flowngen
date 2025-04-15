/* eslint-disable */
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { ILead } from '../../Interface'
import { User } from './User'

@Entity()
export class Lead implements ILead {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    name?: string

    @Column()
    email?: string

    @Column()
    phone?: string

    @Column()
    chatflowid: string

    @Column()
    chatId: string

    @CreateDateColumn()
    createdDate: Date

    // 🔐 Multi-tenancy: associate with User
    @Column({ type: 'uuid' })
    userId: string

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User
}
