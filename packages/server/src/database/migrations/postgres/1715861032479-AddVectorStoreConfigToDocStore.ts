import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddVectorStoreConfigToDocStore1715861032479 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'document_store'
                    AND column_name = 'vectorStoreConfig'
                ) THEN
                    ALTER TABLE "document_store" ADD COLUMN "vectorStoreConfig" TEXT;
                END IF;

                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'document_store'
                    AND column_name = 'embeddingConfig'
                ) THEN
                    ALTER TABLE "document_store" ADD COLUMN "embeddingConfig" TEXT;
                END IF;

                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'document_store'
                    AND column_name = 'recordManagerConfig'
                ) THEN
                    ALTER TABLE "document_store" ADD COLUMN "recordManagerConfig" TEXT;
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
                    WHERE table_name = 'document_store'
                    AND column_name = 'vectorStoreConfig'
                ) THEN
                    ALTER TABLE "document_store" DROP COLUMN "vectorStoreConfig";
                END IF;

                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'document_store'
                    AND column_name = 'embeddingConfig'
                ) THEN
                    ALTER TABLE "document_store" DROP COLUMN "embeddingConfig";
                END IF;

                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'document_store'
                    AND column_name = 'recordManagerConfig'
                ) THEN
                    ALTER TABLE "document_store" DROP COLUMN "recordManagerConfig";
                END IF;
            END$$;
        `)
    }
}
