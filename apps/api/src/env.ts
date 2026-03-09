import { z } from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  API_URL: z.url(),
  FRONTEND_URL: z.url(),
  NODE_ENV: z
    .enum(['production', 'development', 'test'])
    .default('development'),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string(),
  APP_DOMAIN: z.string().optional()
})

const result = envSchema.safeParse(process.env)
if (!result.success) {
  console.error('Invalid environment variables', result.error.message)
  throw new Error('Invalid environment variables')
}

export const env = result.data
