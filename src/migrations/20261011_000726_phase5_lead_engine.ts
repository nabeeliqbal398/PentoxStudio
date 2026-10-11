import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_leads_email_log_auto_reply" AS ENUM('sent', 'skipped', 'failed');
  CREATE TYPE "public"."enum_leads_email_log_alert" AS ENUM('sent', 'skipped', 'failed');
  ALTER TYPE "public"."enum_pages_template" ADD VALUE 'free-audit';
  ALTER TYPE "public"."enum_pages_template" ADD VALUE 'cost-estimator';
  ALTER TYPE "public"."enum__pages_v_version_template" ADD VALUE 'free-audit';
  ALTER TYPE "public"."enum__pages_v_version_template" ADD VALUE 'cost-estimator';
  CREATE TABLE "lead_forms_options_budget" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "lead_forms_options_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "lead_forms" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"form_service_step" varchar,
  	"form_service_help" varchar,
  	"form_details_step" varchar,
  	"form_contact_step" varchar,
  	"form_budget_label" varchar,
  	"form_timeline_label" varchar,
  	"form_message_label" varchar,
  	"form_name_label" varchar,
  	"form_email_label" varchar,
  	"form_whatsapp_label" varchar,
  	"form_contact_hint" varchar,
  	"form_privacy_text" varchar,
  	"form_privacy_link_label" varchar,
  	"form_next" varchar,
  	"form_back" varchar,
  	"form_submit" varchar,
  	"form_sending" varchar,
  	"form_step_of" varchar,
  	"form_choose_service" varchar,
  	"messages_invalid" varchar,
  	"messages_need_contact" varchar,
  	"messages_rate_limited" varchar,
  	"messages_verification" varchar,
  	"messages_failed" varchar,
  	"audit_website_label" varchar,
  	"audit_goal_label" varchar,
  	"audit_submit" varchar,
  	"estimator_service_title" varchar,
  	"estimator_scope_title" varchar,
  	"estimator_scope_help" varchar,
  	"estimator_timeline_title" varchar,
  	"estimator_result_title" varchar,
  	"estimator_range_label" varchar,
  	"estimator_from_label" varchar,
  	"estimator_contact_us_title" varchar,
  	"estimator_contact_us_text" varchar,
  	"estimator_unlock_title" varchar,
  	"estimator_unlock_text" varchar,
  	"estimator_unlock_button" varchar,
  	"estimator_request_button" varchar,
  	"estimator_breakdown_title" varchar,
  	"estimator_base_label" varchar,
  	"estimator_timeline_line" varchar,
  	"estimator_total_label" varchar,
  	"estimator_disclaimer" varchar,
  	"estimator_thanks" varchar,
  	"estimator_restart" varchar,
  	"estimator_unavailable_title" varchar,
  	"estimator_unavailable_text" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "leads" ADD COLUMN "submitted_path" varchar;
  ALTER TABLE "leads" ADD COLUMN "email_log_auto_reply" "enum_leads_email_log_auto_reply";
  ALTER TABLE "leads" ADD COLUMN "email_log_alert" "enum_leads_email_log_alert";
  ALTER TABLE "leads" ADD COLUMN "email_log_error" varchar;
  ALTER TABLE "leads" ADD COLUMN "ip_hash" varchar;
  ALTER TABLE "lead_forms_options_budget" ADD CONSTRAINT "lead_forms_options_budget_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lead_forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lead_forms_options_timeline" ADD CONSTRAINT "lead_forms_options_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lead_forms"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "lead_forms_options_budget_order_idx" ON "lead_forms_options_budget" USING btree ("_order");
  CREATE INDEX "lead_forms_options_budget_parent_id_idx" ON "lead_forms_options_budget" USING btree ("_parent_id");
  CREATE INDEX "lead_forms_options_timeline_order_idx" ON "lead_forms_options_timeline" USING btree ("_order");
  CREATE INDEX "lead_forms_options_timeline_parent_id_idx" ON "lead_forms_options_timeline" USING btree ("_parent_id");
  CREATE INDEX "leads_ip_hash_idx" ON "leads" USING btree ("ip_hash");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "lead_forms_options_budget" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lead_forms_options_timeline" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lead_forms" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "lead_forms_options_budget" CASCADE;
  DROP TABLE "lead_forms_options_timeline" CASCADE;
  DROP TABLE "lead_forms" CASCADE;
  ALTER TABLE "pages" ALTER COLUMN "template" SET DATA TYPE text;
  ALTER TABLE "pages" ALTER COLUMN "template" SET DEFAULT 'default'::text;
  DROP TYPE "public"."enum_pages_template";
  CREATE TYPE "public"."enum_pages_template" AS ENUM('default', 'about', 'contact', 'book-a-call', 'thank-you', 'services-hub', 'industries-hub');
  ALTER TABLE "pages" ALTER COLUMN "template" SET DEFAULT 'default'::"public"."enum_pages_template";
  ALTER TABLE "pages" ALTER COLUMN "template" SET DATA TYPE "public"."enum_pages_template" USING "template"::"public"."enum_pages_template";
  ALTER TABLE "_pages_v" ALTER COLUMN "version_template" SET DATA TYPE text;
  ALTER TABLE "_pages_v" ALTER COLUMN "version_template" SET DEFAULT 'default'::text;
  DROP TYPE "public"."enum__pages_v_version_template";
  CREATE TYPE "public"."enum__pages_v_version_template" AS ENUM('default', 'about', 'contact', 'book-a-call', 'thank-you', 'services-hub', 'industries-hub');
  ALTER TABLE "_pages_v" ALTER COLUMN "version_template" SET DEFAULT 'default'::"public"."enum__pages_v_version_template";
  ALTER TABLE "_pages_v" ALTER COLUMN "version_template" SET DATA TYPE "public"."enum__pages_v_version_template" USING "version_template"::"public"."enum__pages_v_version_template";
  DROP INDEX "leads_ip_hash_idx";
  ALTER TABLE "leads" DROP COLUMN "submitted_path";
  ALTER TABLE "leads" DROP COLUMN "email_log_auto_reply";
  ALTER TABLE "leads" DROP COLUMN "email_log_alert";
  ALTER TABLE "leads" DROP COLUMN "email_log_error";
  ALTER TABLE "leads" DROP COLUMN "ip_hash";
  DROP TYPE "public"."enum_leads_email_log_auto_reply";
  DROP TYPE "public"."enum_leads_email_log_alert";`)
}
