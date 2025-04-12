import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddChatHistory1694658756136 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'chat_message' AND column_name = 'chatType'
                ) THEN
                    ALTER TABLE "chat_message" ADD COLUMN "chatType" VARCHAR NOT NULL DEFAULT 'INTERNAL';
                END IF;

                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'chat_message' AND column_name = 'chatId'
                ) THEN
                    ALTER TABLE "chat_message" ADD COLUMN "chatId" VARCHAR;
                END IF;

                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'chat_message' AND column_name = 'memoryType'
                ) THEN
                    ALTER TABLE "chat_message" ADD COLUMN "memoryType" VARCHAR;
                END IF;

                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'chat_message' AND column_name = 'sessionId'
                ) THEN
                    ALTER TABLE "chat_message" ADD COLUMN "sessionId" VARCHAR;
                END IF;
            END$$;
        `)

        const columnsExist = await queryRunner.query(`
            SELECT column_name FROM information_schema.columns
            WHERE table_name = 'chat_message' AND column_name = 'chatId'
        `)
        const chatIdExists = columnsExist.length > 0

        const hasCreatedDate = await queryRunner.query(`
            SELECT column_name FROM information_schema.columns
            WHERE table_name = 'chat_message' AND column_name = 'createdDate'
        `)
        const createdDateExists = hasCreatedDate.length > 0

        if (chatIdExists && createdDateExists) {
            const results: { id: string; chatflowid: string }[] = await queryRunner.query(`
                WITH RankedMessages AS (
                    SELECT
                        "chatflowid",
                        "id",
                        "createdDate",
                        ROW_NUMBER() OVER (PARTITION BY "chatflowid" ORDER BY "createdDate") AS row_num
                    FROM "chat_message"
                )
                SELECT "chatflowid", "id"
                FROM RankedMessages
                WHERE row_num = 1;
            `)

            for (const chatMessage of results) {
                await queryRunner.query(`
                    UPDATE "chat_message"
                    SET "chatId" = '${chatMessage.id}'
                    WHERE "chatflowid" = '${chatMessage.chatflowid}';
                `)
            }

            await queryRunner.query(`
                ALTER TABLE "chat_message" ALTER COLUMN "chatId" SET NOT NULL;
            `)
        } else {
            console.warn(`[Migration] Skipping chatId population — "chatId" or "createdDate" column not found.`)
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'chat_message' AND column_name = 'chatType'
                ) THEN
                    ALTER TABLE "chat_message" DROP COLUMN "chatType";
                END IF;

                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'chat_message' AND column_name = 'chatId'
                ) THEN
                    ALTER TABLE "chat_message" DROP COLUMN "chatId";
                END IF;

                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'chat_message' AND column_name = 'memoryType'
                ) THEN
                    ALTER TABLE "chat_message" DROP COLUMN "memoryType";
                END IF;

                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'chat_message' AND column_name = 'sessionId'
                ) THEN
                    ALTER TABLE "chat_message" DROP COLUMN "sessionId";
                END IF;
            END$$;
        `)
    }
}
