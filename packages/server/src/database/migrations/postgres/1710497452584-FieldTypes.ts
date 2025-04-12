import { MigrationInterface, QueryRunner } from 'typeorm'

export class FieldTypes1710497452584 implements MigrationInterface {
    name = 'FieldTypes1710497452584'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Safely alter columns if they exist
        const alterIfExists = async (table: string, column: string, type: string, cast: string) => {
            const res = await queryRunner.query(`
                SELECT 1 FROM information_schema.columns
                WHERE table_name = '${table}' AND column_name = '${column}'
            `)
            if (res.length > 0) {
                await queryRunner.query(`ALTER TABLE "${table}" ALTER COLUMN "${column}" TYPE ${type} USING "${column}"::${cast};`)
            }
        }

        await alterIfExists('chat_message', 'chatflowid', 'uuid', 'uuid')
        await alterIfExists('chat_message', 'chatId', 'varchar', 'varchar')
        await alterIfExists('chat_message', 'sessionId', 'varchar', 'varchar')

        await alterIfExists('assistant', 'credential', 'uuid', 'uuid')

        await alterIfExists('chat_message_feedback', 'chatflowid', 'uuid', 'uuid')
        await alterIfExists('chat_message_feedback', 'chatId', 'varchar', 'varchar')
        await alterIfExists('chat_message_feedback', 'messageId', 'uuid', 'uuid')

        // Add constraint if messageId exists
        const hasMessageId = await queryRunner.query(`
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'chat_message_feedback' AND column_name = 'messageId'
        `)

        if (hasMessageId.length > 0) {
            const constraintExists = await queryRunner.query(`
                SELECT 1 FROM information_schema.table_constraints
                WHERE constraint_name = 'UQ_6352078b5a294f2d22179ea7956'
            `)
            if (constraintExists.length === 0) {
                await queryRunner.query(`
                    ALTER TABLE "chat_message_feedback"
                    ADD CONSTRAINT "UQ_6352078b5a294f2d22179ea7956" UNIQUE ("messageId")
                `)
            }
        }

        // Index creation wrapped in safe checks
        const createIndexIfColumnExists = async (table: string, column: string, indexName: string) => {
            const columnExists = await queryRunner.query(`
                SELECT 1 FROM information_schema.columns
                WHERE table_name = '${table}' AND column_name = '${column}'
            `)
            if (columnExists.length > 0) {
                await queryRunner.query(`CREATE INDEX IF NOT EXISTS "${indexName}" ON "${table}" ("${column}");`)
            }
        }

        await createIndexIfColumnExists('chat_message', 'chatflowid', 'IDX_f56c36fe42894d57e5c664d229')
        await createIndexIfColumnExists('chat_message_feedback', 'chatflowid', 'IDX_f56c36fe42894d57e5c664d230')
        await createIndexIfColumnExists('chat_message_feedback', 'chatId', 'IDX_9acddcb7a2b51fe37669049fc6')
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Safely drop indexes
        const dropIndex = async (index: string) => {
            await queryRunner.query(`DROP INDEX IF EXISTS "public"."${index}";`)
        }

        await dropIndex('IDX_9acddcb7a2b51fe37669049fc6')
        await dropIndex('IDX_f56c36fe42894d57e5c664d229')
        await dropIndex('IDX_f56c36fe42894d57e5c664d230')

        // Safely drop constraint
        const constraintExists = await queryRunner.query(`
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name = 'UQ_6352078b5a294f2d22179ea7956'
        `)
        if (constraintExists.length > 0) {
            await queryRunner.query(`
                ALTER TABLE "chat_message_feedback"
                DROP CONSTRAINT "UQ_6352078b5a294f2d22179ea7956";
            `)
        }

        // Safely revert column types
        const revertIfExists = async (table: string, column: string, type: string, cast: string) => {
            const res = await queryRunner.query(`
                SELECT 1 FROM information_schema.columns
                WHERE table_name = '${table}' AND column_name = '${column}'
            `)
            if (res.length > 0) {
                await queryRunner.query(`ALTER TABLE "${table}" ALTER COLUMN "${column}" TYPE ${type} USING "${column}"::${cast};`)
            }
        }

        await revertIfExists('chat_message', 'chatflowid', 'varchar', 'varchar')
        await revertIfExists('chat_message', 'chatId', 'varchar', 'varchar')
        await revertIfExists('chat_message', 'sessionId', 'varchar', 'varchar')

        await revertIfExists('assistant', 'credential', 'varchar', 'varchar')

        await revertIfExists('chat_message_feedback', 'chatflowid', 'varchar', 'varchar')
        await revertIfExists('chat_message_feedback', 'chatId', 'varchar', 'varchar')
        await revertIfExists('chat_message_feedback', 'messageId', 'varchar', 'varchar')
    }
}
