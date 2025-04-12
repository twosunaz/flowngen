import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddAnalytic1694432361423 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1
                    FROM information_schema.columns
                    WHERE table_name = 'chat_flow'
                    AND column_name = 'analytic'
                ) THEN
                    ALTER TABLE "chat_flow" ADD COLUMN "analytic" TEXT;
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
                    AND column_name = 'analytic'
                ) THEN
                    ALTER TABLE "chat_flow" DROP COLUMN "analytic";
                END IF;
            END$$;
        `)
    }
}
