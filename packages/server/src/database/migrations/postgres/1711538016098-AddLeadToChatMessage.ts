import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddLeadToChatMessage1711538016098 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'chat_message'
                    AND column_name = 'leadEmail'
                ) THEN
                    ALTER TABLE "chat_message" ADD COLUMN "leadEmail" TEXT;
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
                    AND column_name = 'leadEmail'
                ) THEN
                    ALTER TABLE "chat_message" DROP COLUMN "leadEmail";
                END IF;
            END$$;
        `)
    }
}
