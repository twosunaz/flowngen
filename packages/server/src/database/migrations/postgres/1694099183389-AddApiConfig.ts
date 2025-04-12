import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddApiConfig1694099183389 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1
                    FROM information_schema.columns
                    WHERE table_name = 'chat_flow'
                    AND column_name = 'apiConfig'
                ) THEN
                    ALTER TABLE "chat_flow" ADD COLUMN "apiConfig" TEXT;
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
                    WHERE table_name = 'chat_flow'
                    AND column_name = 'apiConfig'
                ) THEN
                    ALTER TABLE "chat_flow" DROP COLUMN "apiConfig";
                END IF;
            END$$;
        `)
    }
}
