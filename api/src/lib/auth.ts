import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { openAPI } from 'better-auth/plugins'
import { env } from '../env.js'
import { prisma } from './prisma.js'

export const auth = betterAuth({
  trustedOrigins: [env.FRONTEND_URL],
  emailAndPassword: {
    enabled: true
  },
  database: prismaAdapter(prisma, {
    provider: 'postgresql'
  }),
  plugins: [openAPI()]
})
