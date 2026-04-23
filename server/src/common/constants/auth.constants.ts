export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
};

export const AUTH_SKIP_SERIALIZE = "auth_skip_serialize";

