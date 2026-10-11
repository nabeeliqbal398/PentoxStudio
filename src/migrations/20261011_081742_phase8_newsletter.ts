import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_campaign_deliveries_status" AS ENUM('pending', 'sent', 'failed');
  ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'send-campaign-batch' BEFORE 'schedulePublish';
  ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'campaign-scheduler' BEFORE 'schedulePublish';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'send-campaign-batch' BEFORE 'schedulePublish';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'campaign-scheduler' BEFORE 'schedulePublish';
  CREATE TABLE "campaign_deliveries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"campaign_id" integer NOT NULL,
  	"subscriber_id" integer NOT NULL,
  	"email" varchar NOT NULL,
  	"status" "enum_campaign_deliveries_status" DEFAULT 'pending' NOT NULL,
  	"sent_at" timestamp(3) with time zone,
  	"error" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "newsletter" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"signup_heading" varchar,
  	"signup_text" varchar,
  	"signup_email_label" varchar,
  	"signup_email_placeholder" varchar,
  	"signup_button" varchar,
  	"signup_sending" varchar,
  	"signup_consent_text" varchar,
  	"signup_privacy_link_label" varchar,
  	"signup_success" varchar,
  	"signup_error_invalid" varchar,
  	"signup_error_rate" varchar,
  	"signup_error_verification" varchar,
  	"signup_error_failed" varchar,
  	"confirm_page_title" varchar,
  	"confirm_page_intro" varchar,
  	"confirm_page_button" varchar,
  	"confirm_page_done_title" varchar,
  	"confirm_page_done_text" varchar,
  	"confirm_page_invalid_title" varchar,
  	"confirm_page_invalid_text" varchar,
  	"confirm_page_home_link" varchar,
  	"unsubscribe_page_title" varchar,
  	"unsubscribe_page_intro" varchar,
  	"unsubscribe_page_button" varchar,
  	"unsubscribe_page_done_title" varchar,
  	"unsubscribe_page_done_text" varchar,
  	"unsubscribe_page_invalid_title" varchar,
  	"unsubscribe_page_invalid_text" varchar,
  	"unsubscribe_page_home_link" varchar,
  	"emails_confirm_subject" varchar,
  	"emails_confirm_intro" varchar,
  	"emails_confirm_button" varchar,
  	"emails_confirm_ignore" varchar,
  	"emails_reason" varchar,
  	"emails_unsubscribe_link" varchar,
  	"emails_view_on_site" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_jobs_stats" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"stats" jsonb,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "campaigns" ADD COLUMN "progress_cursor" numeric DEFAULT 0;
  ALTER TABLE "campaigns" ADD COLUMN "progress_started_at" timestamp(3) with time zone;
  ALTER TABLE "campaigns" ADD COLUMN "progress_locked_until" timestamp(3) with time zone;
  ALTER TABLE "campaigns" ADD COLUMN "progress_paused_until" timestamp(3) with time zone;
  ALTER TABLE "campaigns" ADD COLUMN "progress_last_error" varchar;
  ALTER TABLE "payload_jobs" ADD COLUMN "meta" jsonb;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "campaign_deliveries_id" integer;
  ALTER TABLE "home" ADD COLUMN "sections_newsletter" boolean DEFAULT false;
  ALTER TABLE "campaign_deliveries" ADD CONSTRAINT "campaign_deliveries_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "campaign_deliveries" ADD CONSTRAINT "campaign_deliveries_subscriber_id_subscribers_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."subscribers"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "campaign_deliveries_campaign_idx" ON "campaign_deliveries" USING btree ("campaign_id");
  CREATE INDEX "campaign_deliveries_subscriber_idx" ON "campaign_deliveries" USING btree ("subscriber_id");
  CREATE INDEX "campaign_deliveries_status_idx" ON "campaign_deliveries" USING btree ("status");
  CREATE INDEX "campaign_deliveries_updated_at_idx" ON "campaign_deliveries" USING btree ("updated_at");
  CREATE INDEX "campaign_deliveries_created_at_idx" ON "campaign_deliveries" USING btree ("created_at");
  CREATE UNIQUE INDEX "campaign_subscriber_idx" ON "campaign_deliveries" USING btree ("campaign_id","subscriber_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_campaign_deliveries_fk" FOREIGN KEY ("campaign_deliveries_id") REFERENCES "public"."campaign_deliveries"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_campaign_deliveries_id_idx" ON "payload_locked_documents_rels" USING btree ("campaign_deliveries_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "campaign_deliveries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "newsletter" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_jobs_stats" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "campaign_deliveries" CASCADE;
  DROP TABLE "newsletter" CASCADE;
  DROP TABLE "payload_jobs_stats" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_campaign_deliveries_fk";
  
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'schedulePublish');
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_log_task_slug" USING "task_slug"::"public"."enum_payload_jobs_log_task_slug";
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'schedulePublish');
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_task_slug" USING "task_slug"::"public"."enum_payload_jobs_task_slug";
  DROP INDEX "payload_locked_documents_rels_campaign_deliveries_id_idx";
  ALTER TABLE "campaigns" DROP COLUMN "progress_cursor";
  ALTER TABLE "campaigns" DROP COLUMN "progress_started_at";
  ALTER TABLE "campaigns" DROP COLUMN "progress_locked_until";
  ALTER TABLE "campaigns" DROP COLUMN "progress_paused_until";
  ALTER TABLE "campaigns" DROP COLUMN "progress_last_error";
  ALTER TABLE "payload_jobs" DROP COLUMN "meta";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "campaign_deliveries_id";
  ALTER TABLE "home" DROP COLUMN "sections_newsletter";
  DROP TYPE "public"."enum_campaign_deliveries_status";`)
}
