import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_pages_template" ADD VALUE 'blog';
  ALTER TYPE "public"."enum__pages_v_version_template" ADD VALUE 'blog';
  ALTER TABLE "site_text" ADD COLUMN "blog_breadcrumb" varchar;
  ALTER TABLE "site_text" ADD COLUMN "blog_search_label" varchar;
  ALTER TABLE "site_text" ADD COLUMN "blog_search_placeholder" varchar;
  ALTER TABLE "site_text" ADD COLUMN "blog_search_button" varchar;
  ALTER TABLE "site_text" ADD COLUMN "blog_all" varchar;
  ALTER TABLE "site_text" ADD COLUMN "blog_filter_label" varchar;
  ALTER TABLE "site_text" ADD COLUMN "blog_featured" varchar;
  ALTER TABLE "site_text" ADD COLUMN "blog_latest" varchar;
  ALTER TABLE "site_text" ADD COLUMN "blog_no_results" varchar;
  ALTER TABLE "site_text" ADD COLUMN "blog_clear" varchar;
  ALTER TABLE "site_text" ADD COLUMN "blog_previous" varchar;
  ALTER TABLE "site_text" ADD COLUMN "blog_next" varchar;
  ALTER TABLE "site_text" ADD COLUMN "blog_page_of" varchar;
  ALTER TABLE "site_text" ADD COLUMN "blog_read_time" varchar;
  ALTER TABLE "site_text" ADD COLUMN "blog_updated" varchar;
  ALTER TABLE "site_text" ADD COLUMN "blog_by" varchar;
  ALTER TABLE "site_text" ADD COLUMN "blog_toc" varchar;
  ALTER TABLE "site_text" ADD COLUMN "blog_share" varchar;
  ALTER TABLE "site_text" ADD COLUMN "blog_share_facebook" varchar;
  ALTER TABLE "site_text" ADD COLUMN "blog_share_linkedin" varchar;
  ALTER TABLE "site_text" ADD COLUMN "blog_share_x" varchar;
  ALTER TABLE "site_text" ADD COLUMN "blog_share_whatsapp" varchar;
  ALTER TABLE "site_text" ADD COLUMN "blog_related_service" varchar;
  ALTER TABLE "site_text" ADD COLUMN "blog_related_posts" varchar;
  ALTER TABLE "site_text" ADD COLUMN "blog_about_author" varchar;
  ALTER TABLE "site_text" ADD COLUMN "blog_author_posts" varchar;
  ALTER TABLE "site_text" ADD COLUMN "blog_category_eyebrow" varchar;
  ALTER TABLE "site_text" ADD COLUMN "blog_author_eyebrow" varchar;
  ALTER TABLE "site_text" ADD COLUMN "blog_rss" varchar;
  ALTER TABLE "site_text" ADD COLUMN "blog_mid_cta_heading" varchar;
  ALTER TABLE "site_text" ADD COLUMN "blog_mid_cta_text" varchar;
  ALTER TABLE "site_text" ADD COLUMN "blog_mid_cta_button" varchar;
  ALTER TABLE "site_text" ADD COLUMN "blog_mid_cta_url" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" ALTER COLUMN "template" SET DATA TYPE text;
  ALTER TABLE "pages" ALTER COLUMN "template" SET DEFAULT 'default'::text;
  DROP TYPE "public"."enum_pages_template";
  CREATE TYPE "public"."enum_pages_template" AS ENUM('default', 'about', 'contact', 'book-a-call', 'thank-you', 'services-hub', 'industries-hub', 'free-audit', 'cost-estimator', 'portfolio');
  ALTER TABLE "pages" ALTER COLUMN "template" SET DEFAULT 'default'::"public"."enum_pages_template";
  ALTER TABLE "pages" ALTER COLUMN "template" SET DATA TYPE "public"."enum_pages_template" USING "template"::"public"."enum_pages_template";
  ALTER TABLE "_pages_v" ALTER COLUMN "version_template" SET DATA TYPE text;
  ALTER TABLE "_pages_v" ALTER COLUMN "version_template" SET DEFAULT 'default'::text;
  DROP TYPE "public"."enum__pages_v_version_template";
  CREATE TYPE "public"."enum__pages_v_version_template" AS ENUM('default', 'about', 'contact', 'book-a-call', 'thank-you', 'services-hub', 'industries-hub', 'free-audit', 'cost-estimator', 'portfolio');
  ALTER TABLE "_pages_v" ALTER COLUMN "version_template" SET DEFAULT 'default'::"public"."enum__pages_v_version_template";
  ALTER TABLE "_pages_v" ALTER COLUMN "version_template" SET DATA TYPE "public"."enum__pages_v_version_template" USING "version_template"::"public"."enum__pages_v_version_template";
  ALTER TABLE "site_text" DROP COLUMN "blog_breadcrumb";
  ALTER TABLE "site_text" DROP COLUMN "blog_search_label";
  ALTER TABLE "site_text" DROP COLUMN "blog_search_placeholder";
  ALTER TABLE "site_text" DROP COLUMN "blog_search_button";
  ALTER TABLE "site_text" DROP COLUMN "blog_all";
  ALTER TABLE "site_text" DROP COLUMN "blog_filter_label";
  ALTER TABLE "site_text" DROP COLUMN "blog_featured";
  ALTER TABLE "site_text" DROP COLUMN "blog_latest";
  ALTER TABLE "site_text" DROP COLUMN "blog_no_results";
  ALTER TABLE "site_text" DROP COLUMN "blog_clear";
  ALTER TABLE "site_text" DROP COLUMN "blog_previous";
  ALTER TABLE "site_text" DROP COLUMN "blog_next";
  ALTER TABLE "site_text" DROP COLUMN "blog_page_of";
  ALTER TABLE "site_text" DROP COLUMN "blog_read_time";
  ALTER TABLE "site_text" DROP COLUMN "blog_updated";
  ALTER TABLE "site_text" DROP COLUMN "blog_by";
  ALTER TABLE "site_text" DROP COLUMN "blog_toc";
  ALTER TABLE "site_text" DROP COLUMN "blog_share";
  ALTER TABLE "site_text" DROP COLUMN "blog_share_facebook";
  ALTER TABLE "site_text" DROP COLUMN "blog_share_linkedin";
  ALTER TABLE "site_text" DROP COLUMN "blog_share_x";
  ALTER TABLE "site_text" DROP COLUMN "blog_share_whatsapp";
  ALTER TABLE "site_text" DROP COLUMN "blog_related_service";
  ALTER TABLE "site_text" DROP COLUMN "blog_related_posts";
  ALTER TABLE "site_text" DROP COLUMN "blog_about_author";
  ALTER TABLE "site_text" DROP COLUMN "blog_author_posts";
  ALTER TABLE "site_text" DROP COLUMN "blog_category_eyebrow";
  ALTER TABLE "site_text" DROP COLUMN "blog_author_eyebrow";
  ALTER TABLE "site_text" DROP COLUMN "blog_rss";
  ALTER TABLE "site_text" DROP COLUMN "blog_mid_cta_heading";
  ALTER TABLE "site_text" DROP COLUMN "blog_mid_cta_text";
  ALTER TABLE "site_text" DROP COLUMN "blog_mid_cta_button";
  ALTER TABLE "site_text" DROP COLUMN "blog_mid_cta_url";`)
}
