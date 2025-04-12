import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddArtifactsToChatMessage1726156258465 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'chat_message'
                    AND column_name = 'artifacts'
                ) THEN
                    ALTER TABLE "chat_message" ADD COLUMN "artifacts" TEXT;
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
                    AND column_name = 'artifacts'
                ) THEN
                    ALTER TABLE "chat_message" DROP COLUMN "artifacts";
                END IF;
            END$$;
        `)
    }
}
