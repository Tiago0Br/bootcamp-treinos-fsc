import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { openAPI } from 'better-auth/plugins'
import { env } from '../env.js'
import { prisma } from './prisma.js'

export const auth = betterAuth({
  baseURL: env.API_URL,
  trustedOrigins: [env.FRONTEND_URL],
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET
    }
  },
  database: prismaAdapter(prisma, {
    provider: 'postgresql'
  }),
  plugins: [openAPI()]
})
