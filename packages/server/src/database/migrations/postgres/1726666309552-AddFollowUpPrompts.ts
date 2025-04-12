import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddFollowUpPrompts1726666309552 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'chat_flow'
                    AND column_name = 'followUpPrompts'
                ) THEN
                    ALTER TABLE "chat_flow" ADD COLUMN "followUpPrompts" TEXT;
                END IF;

                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'chat_message'
                    AND column_name = 'followUpPrompts'
                ) THEN
                    ALTER TABLE "chat_message" ADD COLUMN "followUpPrompts" TEXT;
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
                    AND column_name = 'followUpPrompts'
                ) THEN
                    ALTER TABLE "chat_flow" DROP COLUMN "followUpPrompts";
                END IF;

                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'chat_message'
                    AND column_name = 'followUpPrompts'
                ) THEN
                    ALTER TABLE "chat_message" DROP COLUMN "followUpPrompts";
                END IF;
            END$$;
        `)
    }
}
