import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateBookAndLoanTables1788276150540 implements MigrationInterface {
  name = 'CreateBookAndLoanTables1788276150540'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "loan" ("id" SERIAL NOT NULL, "code" character varying NOT NULL, "book_id" integer NOT NULL, "loaned_at" date NOT NULL, "due_date" date NOT NULL, "returned_at" date, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_3f859c5b832ee73948e0e4818a9" UNIQUE ("code"), CONSTRAINT "PK_4ceda725a323d254a5fd48bf95f" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."book_status_enum" AS ENUM('available', 'on-loan', 'under-repair')`,
    )
    await queryRunner.query(
      `CREATE TABLE "book" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" character varying NOT NULL, "isbn" character varying, "code" character varying NOT NULL, "author" character varying, "category" character varying, "year" integer, "publisher" character varying, "language" character varying NOT NULL DEFAULT 'es', "pages" integer, "status" "public"."book_status_enum" NOT NULL DEFAULT 'available', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_153910bab5ef6438fb822a0c143" UNIQUE ("code"), CONSTRAINT "PK_a3afef72ec8f80e6e5c310b28a4" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `ALTER TABLE "loan" ADD CONSTRAINT "FK_f6371fa812ea961c326e0ef2da4" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "loan" DROP CONSTRAINT "FK_f6371fa812ea961c326e0ef2da4"`,
    )
    await queryRunner.query(`DROP TABLE "book"`)
    await queryRunner.query(`DROP TYPE "public"."book_status_enum"`)
    await queryRunner.query(`DROP TABLE "loan"`)
  }
}
