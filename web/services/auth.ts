import { apiRequest } from "@/lib/api";

import type { UserProfile } from "./types";

export function getCurrentUser() {
  return apiRequest<UserProfile>("/api/auth/me");
}
