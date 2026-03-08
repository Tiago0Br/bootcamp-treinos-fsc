import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string(),
  NEXT_PUBLIC_BASE_URL: z.string()
})

const result = envSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL
})

if (!result.data) {
  console.error('Invalid environment variables:', result.error.message)
  throw new Error('Invalid environment variables')
}

export const env = result.data
