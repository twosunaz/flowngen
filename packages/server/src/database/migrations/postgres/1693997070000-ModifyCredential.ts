import { MigrationInterface, QueryRunner } from 'typeorm'

export class ModifyCredential1693997070000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1
                    FROM information_schema.columns
                    WHERE table_name = 'credential'
                    AND column_name = 'encryptedData'
                ) THEN
                    ALTER TABLE "credential" ADD COLUMN "encryptedData" TEXT;
                ELSE
                    ALTER TABLE "credential" ALTER COLUMN "encryptedData" TYPE TEXT;
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
                    WHERE table_name = 'credential'
                    AND column_name = 'encryptedData'
                ) THEN
                    ALTER TABLE "credential" ALTER COLUMN "encryptedData" TYPE VARCHAR;
                END IF;
            END$$;
        `)
    }
}
