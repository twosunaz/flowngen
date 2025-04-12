import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddUsedToolsToChatMessage1699481607341 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'chat_message'
                    AND column_name = 'usedTools'
                ) THEN
                    ALTER TABLE "chat_message" ADD COLUMN "usedTools" TEXT;
                END IF;
            END$$;
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'chat_message'
                    AND column_name = 'usedTools'
                ) THEN
                    ALTER TABLE "chat_message" DROP COLUMN "usedTools";
                END IF;
            END$$;
        `)
    }
}
