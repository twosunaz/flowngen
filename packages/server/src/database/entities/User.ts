import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity({ name: 'user' })
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'varchar', length: 255, unique: true })
    username: string

    @Column({ type: 'varchar', length: 255, select: false })
    password: string

    @Column({ type: 'varchar', length: 100, nullable: true })
    email: string

    @Column({ type: 'boolean', default: true })
    isActive: boolean

    @CreateDateColumn()
    created_At: Date

    @UpdateDateColumn()
    updated_At: Date
}
