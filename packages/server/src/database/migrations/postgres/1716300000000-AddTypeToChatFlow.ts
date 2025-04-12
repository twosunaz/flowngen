import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddTypeToChatFlow1716300000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'chat_flow'
                    AND column_name = 'type'
                ) THEN
                    ALTER TABLE "chat_flow" ADD COLUMN "type" TEXT;
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
                    WHERE table_name = 'chat_flow'
                    AND column_name = 'type'
                ) THEN
                    ALTER TABLE "chat_flow" DROP COLUMN "type";
                END IF;
            END$$;
        `)
    }
}
