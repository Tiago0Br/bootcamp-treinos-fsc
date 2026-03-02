import { z } from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string()
})

const result = envSchema.safeParse(process.env)
if (!result.success) {
  console.error('Invalid environment variables', result.error.message)
  throw new Error('Invalid environment variables')
}

export const env = result.data
