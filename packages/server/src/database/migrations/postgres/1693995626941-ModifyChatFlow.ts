import { MigrationInterface, QueryRunner } from 'typeorm'

export class ModifyChatFlow1693995626941 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1
                    FROM information_schema.columns
                    WHERE table_name='chat_flow'
                    AND column_name='chatbotConfig'
                ) THEN
                    ALTER TABLE "chat_flow" ADD COLUMN "chatbotConfig" TEXT;
                END IF;
            END$$;
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "chat_flow" DROP COLUMN IF EXISTS "chatbotConfig";
        `)
    }
}
