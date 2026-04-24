CREATE INDEX "task_comments_task_id_created_at_idx" ON "task_comments"("task_id", "created_at");

CREATE INDEX "task_activity_logs_task_id_created_at_idx" ON "task_activity_logs"("task_id", "created_at");

CREATE INDEX "task_activity_logs_project_id_created_at_idx" ON "task_activity_logs"("project_id", "created_at");
