import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'index-knowledge' BEFORE 'schedulePublish';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'index-knowledge' BEFORE 'schedulePublish';
  CREATE TABLE "chatbot_usage" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"bucket" varchar NOT NULL,
  	"count" numeric DEFAULT 0 NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "chatbot_settings_widget_suggestions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  ALTER TABLE "chat_sessions" ADD COLUMN "user_messages" numeric DEFAULT 0;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "chatbot_usage_id" integer;
  ALTER TABLE "chatbot_settings" ADD COLUMN "injection_reply" varchar;
  ALTER TABLE "chatbot_settings" ADD COLUMN "widget_title" varchar;
  ALTER TABLE "chatbot_settings" ADD COLUMN "widget_launcher_label" varchar;
  ALTER TABLE "chatbot_settings" ADD COLUMN "widget_placeholder" varchar;
  ALTER TABLE "chatbot_settings" ADD COLUMN "widget_send" varchar;
  ALTER TABLE "chatbot_settings" ADD COLUMN "widget_close" varchar;
  ALTER TABLE "chatbot_settings" ADD COLUMN "widget_thinking" varchar;
  ALTER TABLE "chatbot_settings" ADD COLUMN "widget_privacy_note" varchar;
  ALTER TABLE "chatbot_settings" ADD COLUMN "widget_error_text" varchar;
  ALTER TABLE "chatbot_settings" ADD COLUMN "widget_whatsapp_button" varchar;
  ALTER TABLE "chatbot_settings" ADD COLUMN "widget_lead_saved" varchar;
  ALTER TABLE "chatbot_settings" ADD COLUMN "widget_new_chat" varchar;
  ALTER TABLE "chatbot_settings_widget_suggestions" ADD CONSTRAINT "chatbot_settings_widget_suggestions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."chatbot_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "chatbot_usage_bucket_idx" ON "chatbot_usage" USING btree ("bucket");
  CREATE INDEX "chatbot_usage_updated_at_idx" ON "chatbot_usage" USING btree ("updated_at");
  CREATE INDEX "chatbot_usage_created_at_idx" ON "chatbot_usage" USING btree ("created_at");
  CREATE INDEX "chatbot_settings_widget_suggestions_order_idx" ON "chatbot_settings_widget_suggestions" USING btree ("_order");
  CREATE INDEX "chatbot_settings_widget_suggestions_parent_id_idx" ON "chatbot_settings_widget_suggestions" USING btree ("_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_chatbot_usage_fk" FOREIGN KEY ("chatbot_usage_id") REFERENCES "public"."chatbot_usage"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_chatbot_usage_id_idx" ON "payload_locked_documents_rels" USING btree ("chatbot_usage_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "chatbot_usage" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "chatbot_settings_widget_suggestions" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "chatbot_usage" CASCADE;
  DROP TABLE "chatbot_settings_widget_suggestions" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_chatbot_usage_fk";
  
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'send-campaign-batch', 'campaign-scheduler', 'schedulePublish');
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_log_task_slug" USING "task_slug"::"public"."enum_payload_jobs_log_task_slug";
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'send-campaign-batch', 'campaign-scheduler', 'schedulePublish');
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_task_slug" USING "task_slug"::"public"."enum_payload_jobs_task_slug";
  DROP INDEX "payload_locked_documents_rels_chatbot_usage_id_idx";
  ALTER TABLE "chat_sessions" DROP COLUMN "user_messages";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "chatbot_usage_id";
  ALTER TABLE "chatbot_settings" DROP COLUMN "injection_reply";
  ALTER TABLE "chatbot_settings" DROP COLUMN "widget_title";
  ALTER TABLE "chatbot_settings" DROP COLUMN "widget_launcher_label";
  ALTER TABLE "chatbot_settings" DROP COLUMN "widget_placeholder";
  ALTER TABLE "chatbot_settings" DROP COLUMN "widget_send";
  ALTER TABLE "chatbot_settings" DROP COLUMN "widget_close";
  ALTER TABLE "chatbot_settings" DROP COLUMN "widget_thinking";
  ALTER TABLE "chatbot_settings" DROP COLUMN "widget_privacy_note";
  ALTER TABLE "chatbot_settings" DROP COLUMN "widget_error_text";
  ALTER TABLE "chatbot_settings" DROP COLUMN "widget_whatsapp_button";
  ALTER TABLE "chatbot_settings" DROP COLUMN "widget_lead_saved";
  ALTER TABLE "chatbot_settings" DROP COLUMN "widget_new_chat";`)
}
