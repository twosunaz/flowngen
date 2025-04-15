import { Column, Entity, Index, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm'
import { IDocumentStoreFileChunk } from '../../Interface'
import { User } from './User'

@Entity()
export class DocumentStoreFileChunk implements IDocumentStoreFileChunk {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Index()
    @Column({ type: 'uuid' })
    docId: string

    @Index()
    @Column({ type: 'uuid' })
    storeId: string

    @Column()
    chunkNo: number

    @Column({ nullable: false, type: 'text' })
    pageContent: string

    @Column({ nullable: true, type: 'text' })
    metadata: string

    // 🔐 Multi-tenancy: associate with User
    @Column({ type: 'uuid' })
    userId: string

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User
}
