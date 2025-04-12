import { MigrationInterface, QueryRunner } from 'typeorm'

export class ModifyChatMessage1693996694528 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1
                    FROM information_schema.columns
                    WHERE table_name = 'chat_message'
                    AND column_name = 'sourceDocuments'
                ) THEN
                    ALTER TABLE "chat_message" ADD COLUMN "sourceDocuments" TEXT;
                ELSE
                    ALTER TABLE "chat_message" ALTER COLUMN "sourceDocuments" TYPE TEXT;
                END IF;
            END$$;
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1
                    FROM information_schema.columns
                    WHERE table_name = 'chat_message'
                    AND column_name = 'sourceDocuments'
                ) THEN
                    ALTER TABLE "chat_message" ALTER COLUMN "sourceDocuments" TYPE VARCHAR;
                END IF;
            END$$;
        `)
    }
}
