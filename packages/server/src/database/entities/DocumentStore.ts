import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { DocumentStoreStatus, IDocumentStore } from '../../Interface'
import { User } from './User'

@Entity()
export class DocumentStore implements IDocumentStore {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ nullable: false, type: 'text' })
    name: string

    @Column({ nullable: true, type: 'text' })
    description: string

    @Column({ nullable: true, type: 'text' })
    loaders: string

    @Column({ nullable: true, type: 'text' })
    whereUsed: string

    @Column({ type: 'timestamp' })
    @CreateDateColumn()
    createdDate: Date

    @Column({ type: 'timestamp' })
    @UpdateDateColumn()
    updatedDate: Date

    @Column({ nullable: false, type: 'text' })
    status: DocumentStoreStatus

    @Column({ nullable: true, type: 'text' })
    vectorStoreConfig: string | null

    @Column({ nullable: true, type: 'text' })
    embeddingConfig: string | null

    @Column({ nullable: true, type: 'text' })
    recordManagerConfig: string | null

    // 🔐 Multi-tenancy: associate with User
    @Column({ type: 'uuid' })
    userId: string

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User
}
