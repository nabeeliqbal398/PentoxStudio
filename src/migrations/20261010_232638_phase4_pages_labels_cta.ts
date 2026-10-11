import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_template" AS ENUM('default', 'about', 'contact', 'book-a-call', 'thank-you', 'services-hub', 'industries-hub');
  CREATE TYPE "public"."enum__pages_v_version_template" AS ENUM('default', 'about', 'contact', 'book-a-call', 'thank-you', 'services-hub', 'industries-hub');
  CREATE TABLE "pages_highlights_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"faqs_id" integer
  );
  
  CREATE TABLE "_pages_v_version_highlights_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"faqs_id" integer
  );
  
  CREATE TABLE "site_text" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"common_home" varchar,
  	"common_services" varchar,
  	"common_industries" varchar,
  	"common_learn_more" varchar,
  	"common_view_all_services" varchar,
  	"common_view_all_projects" varchar,
  	"common_whatsapp" varchar,
  	"common_call" varchar,
  	"common_email" varchar,
  	"common_book_call" varchar,
  	"common_open_booking" varchar,
  	"common_estimator" varchar,
  	"common_preview_banner" varchar,
  	"service_included" varchar,
  	"service_results" varchar,
  	"service_packages" varchar,
  	"service_price_from" varchar,
  	"service_tools" varchar,
  	"service_industries" varchar,
  	"service_related_projects" varchar,
  	"service_related_posts" varchar,
  	"service_sub_services" varchar,
  	"service_faq" varchar,
  	"industry_challenges" varchar,
  	"industry_services" varchar,
  	"industry_projects" varchar,
  	"industry_faq" varchar,
  	"hubs_how_we_work" varchar,
  	"hubs_featured_projects" varchar,
  	"hubs_faq" varchar,
  	"hubs_no_industries" varchar,
  	"contact_details" varchar,
  	"contact_phone" varchar,
  	"contact_whatsapp" varchar,
  	"contact_email" varchar,
  	"contact_address" varchar,
  	"contact_hours" varchar,
  	"contact_follow" varchar,
  	"contact_map" varchar,
  	"contact_booking" varchar,
  	"contact_reach_us" varchar,
  	"contact_thank_you_projects" varchar,
  	"contact_testimonial" varchar,
  	"contact_faq" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "pages" ADD COLUMN "template" "enum_pages_template" DEFAULT 'default';
  ALTER TABLE "pages" ADD COLUMN "needs_review" boolean DEFAULT false;
  ALTER TABLE "pages" ADD COLUMN "review_note" varchar;
  ALTER TABLE "pages" ADD COLUMN "hero_eyebrow" varchar;
  ALTER TABLE "pages" ADD COLUMN "hero_heading" varchar;
  ALTER TABLE "pages" ADD COLUMN "hero_intro" varchar;
  ALTER TABLE "pages" ADD COLUMN "highlights_heading" varchar;
  ALTER TABLE "pages" ADD COLUMN "highlights_intro" varchar;
  ALTER TABLE "pages" ADD COLUMN "secondary_heading" varchar;
  ALTER TABLE "pages" ADD COLUMN "secondary_text" varchar;
  ALTER TABLE "pages" ADD COLUMN "secondary_button_label" varchar;
  ALTER TABLE "pages" ADD COLUMN "secondary_button_url" varchar;
  ALTER TABLE "pages" ADD COLUMN "cta_heading" varchar;
  ALTER TABLE "pages" ADD COLUMN "cta_text" varchar;
  ALTER TABLE "pages" ADD COLUMN "cta_button_label" varchar;
  ALTER TABLE "pages" ADD COLUMN "cta_button_url" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_template" "enum__pages_v_version_template" DEFAULT 'default';
  ALTER TABLE "_pages_v" ADD COLUMN "version_needs_review" boolean DEFAULT false;
  ALTER TABLE "_pages_v" ADD COLUMN "version_review_note" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_eyebrow" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_heading" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_intro" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_highlights_heading" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_highlights_intro" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_secondary_heading" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_secondary_text" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_secondary_button_label" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_secondary_button_url" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_cta_heading" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_cta_text" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_cta_button_label" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_cta_button_url" varchar;
  ALTER TABLE "_industries_v" ADD COLUMN "autosave" boolean;
  ALTER TABLE "footer" ADD COLUMN "cta_band_heading" varchar;
  ALTER TABLE "footer" ADD COLUMN "cta_band_text" varchar;
  ALTER TABLE "footer" ADD COLUMN "cta_band_primary_cta_label" varchar;
  ALTER TABLE "footer" ADD COLUMN "cta_band_primary_cta_url" varchar;
  ALTER TABLE "footer" ADD COLUMN "cta_band_secondary_cta_label" varchar;
  ALTER TABLE "footer" ADD COLUMN "cta_band_secondary_cta_url" varchar;
  ALTER TABLE "pages_highlights_items" ADD CONSTRAINT "pages_highlights_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_highlights_items" ADD CONSTRAINT "_pages_v_version_highlights_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_highlights_items_order_idx" ON "pages_highlights_items" USING btree ("_order");
  CREATE INDEX "pages_highlights_items_parent_id_idx" ON "pages_highlights_items" USING btree ("_parent_id");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_faqs_id_idx" ON "pages_rels" USING btree ("faqs_id");
  CREATE INDEX "_pages_v_version_highlights_items_order_idx" ON "_pages_v_version_highlights_items" USING btree ("_order");
  CREATE INDEX "_pages_v_version_highlights_items_parent_id_idx" ON "_pages_v_version_highlights_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_rels_order_idx" ON "_pages_v_rels" USING btree ("order");
  CREATE INDEX "_pages_v_rels_parent_idx" ON "_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_pages_v_rels_path_idx" ON "_pages_v_rels" USING btree ("path");
  CREATE INDEX "_pages_v_rels_faqs_id_idx" ON "_pages_v_rels" USING btree ("faqs_id");
  CREATE INDEX "pages_needs_review_idx" ON "pages" USING btree ("needs_review");
  CREATE INDEX "_pages_v_version_version_needs_review_idx" ON "_pages_v" USING btree ("version_needs_review");
  CREATE INDEX "_industries_v_autosave_idx" ON "_industries_v" USING btree ("autosave");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_highlights_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_highlights_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_text" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_highlights_items" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "_pages_v_version_highlights_items" CASCADE;
  DROP TABLE "_pages_v_rels" CASCADE;
  DROP TABLE "site_text" CASCADE;
  DROP INDEX "pages_needs_review_idx";
  DROP INDEX "_pages_v_version_version_needs_review_idx";
  DROP INDEX "_industries_v_autosave_idx";
  ALTER TABLE "pages" DROP COLUMN "template";
  ALTER TABLE "pages" DROP COLUMN "needs_review";
  ALTER TABLE "pages" DROP COLUMN "review_note";
  ALTER TABLE "pages" DROP COLUMN "hero_eyebrow";
  ALTER TABLE "pages" DROP COLUMN "hero_heading";
  ALTER TABLE "pages" DROP COLUMN "hero_intro";
  ALTER TABLE "pages" DROP COLUMN "highlights_heading";
  ALTER TABLE "pages" DROP COLUMN "highlights_intro";
  ALTER TABLE "pages" DROP COLUMN "secondary_heading";
  ALTER TABLE "pages" DROP COLUMN "secondary_text";
  ALTER TABLE "pages" DROP COLUMN "secondary_button_label";
  ALTER TABLE "pages" DROP COLUMN "secondary_button_url";
  ALTER TABLE "pages" DROP COLUMN "cta_heading";
  ALTER TABLE "pages" DROP COLUMN "cta_text";
  ALTER TABLE "pages" DROP COLUMN "cta_button_label";
  ALTER TABLE "pages" DROP COLUMN "cta_button_url";
  ALTER TABLE "_pages_v" DROP COLUMN "version_template";
  ALTER TABLE "_pages_v" DROP COLUMN "version_needs_review";
  ALTER TABLE "_pages_v" DROP COLUMN "version_review_note";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_eyebrow";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_heading";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_intro";
  ALTER TABLE "_pages_v" DROP COLUMN "version_highlights_heading";
  ALTER TABLE "_pages_v" DROP COLUMN "version_highlights_intro";
  ALTER TABLE "_pages_v" DROP COLUMN "version_secondary_heading";
  ALTER TABLE "_pages_v" DROP COLUMN "version_secondary_text";
  ALTER TABLE "_pages_v" DROP COLUMN "version_secondary_button_label";
  ALTER TABLE "_pages_v" DROP COLUMN "version_secondary_button_url";
  ALTER TABLE "_pages_v" DROP COLUMN "version_cta_heading";
  ALTER TABLE "_pages_v" DROP COLUMN "version_cta_text";
  ALTER TABLE "_pages_v" DROP COLUMN "version_cta_button_label";
  ALTER TABLE "_pages_v" DROP COLUMN "version_cta_button_url";
  ALTER TABLE "_industries_v" DROP COLUMN "autosave";
  ALTER TABLE "footer" DROP COLUMN "cta_band_heading";
  ALTER TABLE "footer" DROP COLUMN "cta_band_text";
  ALTER TABLE "footer" DROP COLUMN "cta_band_primary_cta_label";
  ALTER TABLE "footer" DROP COLUMN "cta_band_primary_cta_url";
  ALTER TABLE "footer" DROP COLUMN "cta_band_secondary_cta_label";
  ALTER TABLE "footer" DROP COLUMN "cta_band_secondary_cta_url";
  DROP TYPE "public"."enum_pages_template";
  DROP TYPE "public"."enum__pages_v_version_template";`)
}
