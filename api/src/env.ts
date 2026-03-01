import { z } from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().default(3000)
})

const result = envSchema.safeParse(process.env)
if (!result.success) {
  console.error('Invalid environment variables', result.error.message)
  throw new Error('Invalid environment variables')
}

export const env = result.data
