const configuration = () => ({
  app: {
    port: Number(process.env.PORT ?? 3001),
    host: process.env.HOST ?? "0.0.0.0",
    frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:3000",
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET ?? "replace-with-a-secure-random-string",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
    cookieName: process.env.COOKIE_NAME ?? "pmp_access_token",
    cookieSecure: process.env.COOKIE_SECURE === "true",
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    url: process.env.REDIS_URL,
  },
});

export default configuration;

