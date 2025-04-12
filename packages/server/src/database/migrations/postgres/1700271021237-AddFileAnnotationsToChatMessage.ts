import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddFileAnnotationsToChatMessage1700271021237 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'chat_message'
                    AND column_name = 'fileAnnotations'
                ) THEN
                    ALTER TABLE "chat_message" ADD COLUMN "fileAnnotations" TEXT;
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
                    AND column_name = 'fileAnnotations'
                ) THEN
                    ALTER TABLE "chat_message" DROP COLUMN "fileAnnotations";
                END IF;
            END$$;
        `)
    }
}
