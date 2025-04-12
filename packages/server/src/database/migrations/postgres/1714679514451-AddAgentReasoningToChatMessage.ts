import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddAgentReasoningToChatMessage1714679514451 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'chat_message'
                    AND column_name = 'agentReasoning'
                ) THEN
                    ALTER TABLE "chat_message" ADD COLUMN "agentReasoning" TEXT;
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
                    AND column_name = 'agentReasoning'
                ) THEN
                    ALTER TABLE "chat_message" DROP COLUMN "agentReasoning";
                END IF;
            END$$;
        `)
    }
}
