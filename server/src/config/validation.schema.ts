import * as Joi from "joi";

export const validationSchema = Joi.object({
  DATABASE_URL: Joi.string().uri({ scheme: ["postgresql", "postgres"] }).required(),
  REDIS_URL: Joi.string().uri({ scheme: ["redis"] }).required(),
  PORT: Joi.number().default(3001),
  HOST: Joi.string().default("0.0.0.0"),
  FRONTEND_URL: Joi.string().uri().required(),
  JWT_SECRET: Joi.string().min(16).required(),
  JWT_EXPIRES_IN: Joi.string().default("7d"),
  COOKIE_NAME: Joi.string().default("pmp_access_token"),
  COOKIE_SECURE: Joi.boolean().truthy("true").falsy("false").default(false),
});

