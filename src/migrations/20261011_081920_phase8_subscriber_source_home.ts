import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_subscribers_source" ADD VALUE 'home' BEFORE 'blog-post';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "subscribers" ALTER COLUMN "source" SET DATA TYPE text;
  ALTER TABLE "subscribers" ALTER COLUMN "source" SET DEFAULT 'admin'::text;
  DROP TYPE "public"."enum_subscribers_source";
  CREATE TYPE "public"."enum_subscribers_source" AS ENUM('footer', 'blog-post', 'popup', 'import', 'lead-form', 'admin');
  ALTER TABLE "subscribers" ALTER COLUMN "source" SET DEFAULT 'admin'::"public"."enum_subscribers_source";
  ALTER TABLE "subscribers" ALTER COLUMN "source" SET DATA TYPE "public"."enum_subscribers_source" USING "source"::"public"."enum_subscribers_source";`)
}
