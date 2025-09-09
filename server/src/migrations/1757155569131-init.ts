import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1757155569131 implements MigrationInterface {
  name = 'Init1757155569131';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "measurement" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "period" date NOT NULL, "load_level" numeric(5,2), "flow_mmscmd" numeric(6,2), "tvps_mmscmd" numeric(6,2), "pipelineId" uuid, "pointId" uuid, CONSTRAINT "UQ_812c042eee24aca18963c20a1a6" UNIQUE ("pipelineId", "pointId", "period"), CONSTRAINT "PK_742ff3cc0dcbbd34533a9071dfd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d8adfb68eb2a712a9c5721f7d0" ON "measurement" ("pointId", "period") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9ea782e78655e18fbfc8cb2217" ON "measurement" ("pipelineId", "period") `,
    );
    await queryRunner.query(
      `CREATE TABLE "pipeline" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(256) NOT NULL, "region" character varying(128), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_e3a3ebd1170793f3082f83f9ef1" UNIQUE ("name"), CONSTRAINT "PK_df8aedd50509192d995535d68cd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "connection_point" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(256) NOT NULL, "km" numeric(8,1), "pipelineId" uuid, CONSTRAINT "UQ_24990c2d8ae53f6ecaa798052bd" UNIQUE ("pipelineId", "name"), CONSTRAINT "PK_15e181b065e333445a965384314" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bb68c93c644d2f6750ceb29fbc" ON "connection_point" ("pipelineId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "measurement" ADD CONSTRAINT "FK_d0c2ca986f649a4f2fe7b86fa6e" FOREIGN KEY ("pipelineId") REFERENCES "pipeline"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "measurement" ADD CONSTRAINT "FK_78a976f351d8f2a71de30e097ee" FOREIGN KEY ("pointId") REFERENCES "connection_point"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "connection_point" ADD CONSTRAINT "FK_bb68c93c644d2f6750ceb29fbc4" FOREIGN KEY ("pipelineId") REFERENCES "pipeline"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "connection_point" DROP CONSTRAINT "FK_bb68c93c644d2f6750ceb29fbc4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "measurement" DROP CONSTRAINT "FK_78a976f351d8f2a71de30e097ee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "measurement" DROP CONSTRAINT "FK_d0c2ca986f649a4f2fe7b86fa6e"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_bb68c93c644d2f6750ceb29fbc"`);
    await queryRunner.query(`DROP TABLE "connection_point"`);
    await queryRunner.query(`DROP TABLE "pipeline"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_9ea782e78655e18fbfc8cb2217"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_d8adfb68eb2a712a9c5721f7d0"`);
    await queryRunner.query(`DROP TABLE "measurement"`);
  }
}
