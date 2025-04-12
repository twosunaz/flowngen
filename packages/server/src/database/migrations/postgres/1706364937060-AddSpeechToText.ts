import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddSpeechToText1706364937060 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'chat_flow'
                    AND column_name = 'speechToText'
                ) THEN
                    ALTER TABLE "chat_flow" ADD COLUMN "speechToText" TEXT;
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
                    AND column_name = 'speechToText'
                ) THEN
                    ALTER TABLE "chat_flow" DROP COLUMN "speechToText";
                END IF;
            END$$;
        `)
    }
}
