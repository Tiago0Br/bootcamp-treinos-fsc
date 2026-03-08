import 'dotenv/config'
import { defineConfig } from 'orval'
import { env } from './src/env'

export default defineConfig({
  fetch: {
    input: `${env.NEXT_PUBLIC_API_URL}/swagger.json`,
    output: {
      target: './src/lib/api/fetch-generated/index.ts',
      client: 'fetch',
      biome: true,
      override: {
        mutator: {
          path: './src/lib/fetch.ts',
          name: 'customFetch'
        }
      }
    }
  }
})
