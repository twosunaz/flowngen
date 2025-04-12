import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddFileUploadsToChatMessage1701788586491 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'chat_message'
                    AND column_name = 'fileUploads'
                ) THEN
                    ALTER TABLE "chat_message" ADD COLUMN "fileUploads" TEXT;
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
                    AND column_name = 'fileUploads'
                ) THEN
                    ALTER TABLE "chat_message" DROP COLUMN "fileUploads";
                END IF;
            END$$;
        `)
    }
}
