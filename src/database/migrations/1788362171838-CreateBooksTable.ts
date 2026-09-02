import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateBooksTable1788362171838 implements MigrationInterface {
  name = 'CreateBooksTable1788362171838'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."books_status_enum" AS ENUM('available', 'on-loan', 'under-repair')`,
    )
    await queryRunner.query(
      `CREATE TABLE "books" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" character varying NOT NULL, "isbn" character varying, "code" character varying NOT NULL, "author" character varying, "category" character varying, "year" integer, "publisher" character varying, "language" character varying NOT NULL DEFAULT 'es', "pages" integer, "status" "public"."books_status_enum" NOT NULL DEFAULT 'available', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_c19328bbdf15e7ddbea3812318d" UNIQUE ("code"), CONSTRAINT "PK_f3f2f25a099d24e12545b70b022" PRIMARY KEY ("id"))`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "books"`)
    await queryRunner.query(`DROP TYPE "public"."books_status_enum"`)
  }
}
