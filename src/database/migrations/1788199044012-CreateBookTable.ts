import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateBookTable1788199044012 implements MigrationInterface {
  name = 'CreateBookTable1788199044012'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."book_status_enum" AS ENUM('available', 'on-loan', 'under-repair')`,
    )
    await queryRunner.query(
      `CREATE TABLE "book" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" character varying NOT NULL, "isbn" character varying, "code" character varying NOT NULL, "author" character varying, "category" character varying, "year" integer, "publisher" character varying, "language" character varying NOT NULL DEFAULT 'es', "pages" integer, "status" "public"."book_status_enum" NOT NULL DEFAULT 'available', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_153910bab5ef6438fb822a0c143" UNIQUE ("code"), CONSTRAINT "PK_a3afef72ec8f80e6e5c310b28a4" PRIMARY KEY ("id"))`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "book"`)
    await queryRunner.query(`DROP TYPE "public"."book_status_enum"`)
  }
}
