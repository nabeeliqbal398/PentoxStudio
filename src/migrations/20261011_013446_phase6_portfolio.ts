import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_clients_group" AS ENUM('international', 'domestic');
  ALTER TYPE "public"."enum_pages_template" ADD VALUE 'portfolio';
  ALTER TYPE "public"."enum__pages_v_version_template" ADD VALUE 'portfolio';
  ALTER TABLE "clients" ADD COLUMN "group" "enum_clients_group";
  ALTER TABLE "home" ADD COLUMN "clients_section_heading" varchar;
  ALTER TABLE "home" ADD COLUMN "clients_section_intro" varchar;
  ALTER TABLE "home" ADD COLUMN "clients_section_international_label" varchar;
  ALTER TABLE "home" ADD COLUMN "clients_section_domestic_label" varchar;
  ALTER TABLE "site_text" ADD COLUMN "portfolio_breadcrumb" varchar;
  ALTER TABLE "site_text" ADD COLUMN "portfolio_all" varchar;
  ALTER TABLE "site_text" ADD COLUMN "portfolio_filter_label" varchar;
  ALTER TABLE "site_text" ADD COLUMN "portfolio_empty" varchar;
  ALTER TABLE "site_text" ADD COLUMN "portfolio_worked_on" varchar;
  ALTER TABLE "site_text" ADD COLUMN "portfolio_challenge" varchar;
  ALTER TABLE "site_text" ADD COLUMN "portfolio_solution" varchar;
  ALTER TABLE "site_text" ADD COLUMN "portfolio_results" varchar;
  ALTER TABLE "site_text" ADD COLUMN "portfolio_gallery" varchar;
  ALTER TABLE "site_text" ADD COLUMN "portfolio_tools" varchar;
  ALTER TABLE "site_text" ADD COLUMN "portfolio_testimonial" varchar;
  ALTER TABLE "site_text" ADD COLUMN "portfolio_proof" varchar;
  ALTER TABLE "site_text" ADD COLUMN "portfolio_next_project" varchar;
  ALTER TABLE "site_text" ADD COLUMN "portfolio_visit_project" varchar;
  ALTER TABLE "site_text" ADD COLUMN "portfolio_open_image" varchar;
  ALTER TABLE "site_text" ADD COLUMN "portfolio_close" varchar;
  ALTER TABLE "site_text" ADD COLUMN "portfolio_previous" varchar;
  ALTER TABLE "site_text" ADD COLUMN "portfolio_next" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" ALTER COLUMN "template" SET DATA TYPE text;
  ALTER TABLE "pages" ALTER COLUMN "template" SET DEFAULT 'default'::text;
  DROP TYPE "public"."enum_pages_template";
  CREATE TYPE "public"."enum_pages_template" AS ENUM('default', 'about', 'contact', 'book-a-call', 'thank-you', 'services-hub', 'industries-hub', 'free-audit', 'cost-estimator');
  ALTER TABLE "pages" ALTER COLUMN "template" SET DEFAULT 'default'::"public"."enum_pages_template";
  ALTER TABLE "pages" ALTER COLUMN "template" SET DATA TYPE "public"."enum_pages_template" USING "template"::"public"."enum_pages_template";
  ALTER TABLE "_pages_v" ALTER COLUMN "version_template" SET DATA TYPE text;
  ALTER TABLE "_pages_v" ALTER COLUMN "version_template" SET DEFAULT 'default'::text;
  DROP TYPE "public"."enum__pages_v_version_template";
  CREATE TYPE "public"."enum__pages_v_version_template" AS ENUM('default', 'about', 'contact', 'book-a-call', 'thank-you', 'services-hub', 'industries-hub', 'free-audit', 'cost-estimator');
  ALTER TABLE "_pages_v" ALTER COLUMN "version_template" SET DEFAULT 'default'::"public"."enum__pages_v_version_template";
  ALTER TABLE "_pages_v" ALTER COLUMN "version_template" SET DATA TYPE "public"."enum__pages_v_version_template" USING "version_template"::"public"."enum__pages_v_version_template";
  ALTER TABLE "clients" DROP COLUMN "group";
  ALTER TABLE "home" DROP COLUMN "clients_section_heading";
  ALTER TABLE "home" DROP COLUMN "clients_section_intro";
  ALTER TABLE "home" DROP COLUMN "clients_section_international_label";
  ALTER TABLE "home" DROP COLUMN "clients_section_domestic_label";
  ALTER TABLE "site_text" DROP COLUMN "portfolio_breadcrumb";
  ALTER TABLE "site_text" DROP COLUMN "portfolio_all";
  ALTER TABLE "site_text" DROP COLUMN "portfolio_filter_label";
  ALTER TABLE "site_text" DROP COLUMN "portfolio_empty";
  ALTER TABLE "site_text" DROP COLUMN "portfolio_worked_on";
  ALTER TABLE "site_text" DROP COLUMN "portfolio_challenge";
  ALTER TABLE "site_text" DROP COLUMN "portfolio_solution";
  ALTER TABLE "site_text" DROP COLUMN "portfolio_results";
  ALTER TABLE "site_text" DROP COLUMN "portfolio_gallery";
  ALTER TABLE "site_text" DROP COLUMN "portfolio_tools";
  ALTER TABLE "site_text" DROP COLUMN "portfolio_testimonial";
  ALTER TABLE "site_text" DROP COLUMN "portfolio_proof";
  ALTER TABLE "site_text" DROP COLUMN "portfolio_next_project";
  ALTER TABLE "site_text" DROP COLUMN "portfolio_visit_project";
  ALTER TABLE "site_text" DROP COLUMN "portfolio_open_image";
  ALTER TABLE "site_text" DROP COLUMN "portfolio_close";
  ALTER TABLE "site_text" DROP COLUMN "portfolio_previous";
  ALTER TABLE "site_text" DROP COLUMN "portfolio_next";
  DROP TYPE "public"."enum_clients_group";`)
}
