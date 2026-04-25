CREATE TYPE "ProjectViewType" AS ENUM ('TASK_LIST', 'TASK_BOARD');
CREATE TYPE "ProjectViewScope" AS ENUM ('PERSONAL', 'SHARED');
CREATE TYPE "NotificationType" AS ENUM (
  'TASK_ASSIGNED',
  'TASK_REASSIGNED',
  'COMMENT_MENTION',
  'PROJECT_JOIN_REQUEST',
  'PROJECT_JOIN_APPROVED',
  'PROJECT_JOIN_REJECTED',
  'PROJECT_INVITED',
  'TASK_OVERDUE'
);

CREATE TABLE "project_views" (
  "id" BIGSERIAL NOT NULL,
  "project_id" BIGINT NOT NULL,
  "name" VARCHAR(120) NOT NULL,
  "code" VARCHAR(60),
  "view_type" "ProjectViewType" NOT NULL,
  "scope" "ProjectViewScope" NOT NULL,
  "is_default" BOOLEAN NOT NULL DEFAULT false,
  "created_by" BIGINT NOT NULL,
  "config_json" JSONB NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "project_views_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "notifications" (
  "id" BIGSERIAL NOT NULL,
  "user_id" BIGINT NOT NULL,
  "type" "NotificationType" NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "content" TEXT,
  "related_project_id" BIGINT,
  "related_task_id" BIGINT,
  "actor_id" BIGINT,
  "is_read" BOOLEAN NOT NULL DEFAULT false,
  "metadata_json" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "project_views_project_id_view_type_idx" ON "project_views"("project_id", "view_type");
CREATE INDEX "project_views_created_by_scope_view_type_idx" ON "project_views"("created_by", "scope", "view_type");

CREATE INDEX "notifications_user_id_is_read_created_at_idx" ON "notifications"("user_id", "is_read", "created_at");
CREATE INDEX "notifications_user_id_type_created_at_idx" ON "notifications"("user_id", "type", "created_at");
CREATE INDEX "notifications_related_project_id_idx" ON "notifications"("related_project_id");
CREATE INDEX "notifications_related_task_id_idx" ON "notifications"("related_task_id");

ALTER TABLE "project_views"
  ADD CONSTRAINT "project_views_project_id_fkey"
  FOREIGN KEY ("project_id") REFERENCES "projects"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "project_views"
  ADD CONSTRAINT "project_views_created_by_fkey"
  FOREIGN KEY ("created_by") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "notifications"
  ADD CONSTRAINT "notifications_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "notifications"
  ADD CONSTRAINT "notifications_actor_id_fkey"
  FOREIGN KEY ("actor_id") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "notifications"
  ADD CONSTRAINT "notifications_related_project_id_fkey"
  FOREIGN KEY ("related_project_id") REFERENCES "projects"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "notifications"
  ADD CONSTRAINT "notifications_related_task_id_fkey"
  FOREIGN KEY ("related_task_id") REFERENCES "tasks"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
