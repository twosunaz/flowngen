import { MigrationInterface, QueryRunner } from 'typeorm'

export class ModifyTool1693997339912 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'tool' AND column_name = 'schema'
                ) THEN
                    ALTER TABLE "tool" ADD COLUMN "schema" TEXT;
                ELSE
                    ALTER TABLE "tool" ALTER COLUMN "schema" TYPE TEXT;
                END IF;

                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'tool' AND column_name = 'func'
                ) THEN
                    ALTER TABLE "tool" ADD COLUMN "func" TEXT;
                ELSE
                    ALTER TABLE "tool" ALTER COLUMN "func" TYPE TEXT;
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
                    WHERE table_name = 'tool' AND column_name = 'schema'
                ) THEN
                    ALTER TABLE "tool" ALTER COLUMN "schema" TYPE VARCHAR;
                END IF;

                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'tool' AND column_name = 'func'
                ) THEN
                    ALTER TABLE "tool" ALTER COLUMN "func" TYPE VARCHAR;
                END IF;
            END$$;
        `)
    }
}
