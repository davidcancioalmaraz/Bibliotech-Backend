import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateLoansTable1788362407097 implements MigrationInterface {
  name = 'CreateLoansTable1788362407097'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "loans" ("id" SERIAL NOT NULL, "code" character varying NOT NULL, "book_id" integer NOT NULL, "user_id" integer NOT NULL, "loaned_at" date NOT NULL, "due_date" date NOT NULL, "returned_at" date, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_abd6b492656d221ef7774aea1a7" UNIQUE ("code"), CONSTRAINT "PK_5c6942c1e13e4de135c5203ee61" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `ALTER TABLE "loans" ADD CONSTRAINT "FK_09b09d3d1b8e33c0f8dd4cafa48" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "loans" ADD CONSTRAINT "FK_d135791c39e46e13ca4c2725fbb" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "loans" DROP CONSTRAINT "FK_d135791c39e46e13ca4c2725fbb"`,
    )
    await queryRunner.query(
      `ALTER TABLE "loans" DROP CONSTRAINT "FK_09b09d3d1b8e33c0f8dd4cafa48"`,
    )
    await queryRunner.query(`DROP TABLE "loans"`)
  }
}
