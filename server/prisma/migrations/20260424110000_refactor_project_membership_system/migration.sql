-- Rename visibility enum values to the new product language.
ALTER TYPE "ProjectVisibility" RENAME VALUE 'INTERNAL' TO 'MEMBERS_VISIBLE';
ALTER TYPE "ProjectVisibility" RENAME VALUE 'PUBLIC' TO 'ORG_VISIBLE';

-- Add join policy and member status enums.
CREATE TYPE "JoinPolicy" AS ENUM ('INVITE_ONLY', 'REQUEST_APPROVAL', 'OPEN');
CREATE TYPE "ProjectMemberStatus" AS ENUM ('ACTIVE', 'INVITED', 'PENDING');

-- Rebuild project role enum with the new role system.
CREATE TYPE "ProjectRole_new" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'GUEST');

ALTER TABLE "projects"
  ADD COLUMN "join_policy" "JoinPolicy" NOT NULL DEFAULT 'INVITE_ONLY',
  ADD COLUMN "member_color_seed" VARCHAR(60);

ALTER TABLE "project_members"
  ADD COLUMN "status" "ProjectMemberStatus" NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN "joined_at" TIMESTAMP(3),
  ADD COLUMN "invited_by" BIGINT,
  ADD COLUMN "approved_by" BIGINT,
  ADD COLUMN "display_color_token" VARCHAR(30);

ALTER TABLE "project_members"
  ALTER COLUMN "role" TYPE "ProjectRole_new"
  USING (
    CASE "role"::text
      WHEN 'PROJECT_ADMIN' THEN 'ADMIN'::"ProjectRole_new"
      WHEN 'MODULE_OWNER' THEN 'MEMBER'::"ProjectRole_new"
      WHEN 'MEMBER' THEN 'MEMBER'::"ProjectRole_new"
      WHEN 'GUEST' THEN 'GUEST'::"ProjectRole_new"
      ELSE 'MEMBER'::"ProjectRole_new"
    END
  );

DROP TYPE "ProjectRole";
ALTER TYPE "ProjectRole_new" RENAME TO "ProjectRole";

UPDATE "project_members"
SET "joined_at" = "created_at"
WHERE "status" = 'ACTIVE' AND "joined_at" IS NULL;

UPDATE "project_members" pm
SET
  "role" = 'OWNER',
  "status" = 'ACTIVE',
  "joined_at" = COALESCE(pm."joined_at", pm."created_at")
FROM "projects" p
WHERE p."id" = pm."project_id" AND p."owner_id" = pm."user_id";

CREATE INDEX "project_members_project_id_status_idx" ON "project_members"("project_id", "status");
CREATE INDEX "project_members_user_id_status_idx" ON "project_members"("user_id", "status");

ALTER TABLE "project_members"
  ADD CONSTRAINT "project_members_invited_by_fkey"
  FOREIGN KEY ("invited_by") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "project_members"
  ADD CONSTRAINT "project_members_approved_by_fkey"
  FOREIGN KEY ("approved_by") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
