import type { FastifyInstance } from 'fastify'
import { auth } from '../lib/auth.js'

export async function authRoutes(app: FastifyInstance) {
  app.route({
    method: ['GET', 'POST'],
    url: '/api/auth/*',
    schema: {
      hide: true
    },
    async handler(request, reply) {
      try {
        const url = new URL(request.url, `http://${request.headers.host}`)
        const headers = new Headers()
        Object.entries(request.headers).forEach(([key, value]) => {
          if (value) headers.append(key, value.toString())
        })
        const req = new Request(url.toString(), {
          method: request.method,
          headers,
          ...(request.body ? { body: JSON.stringify(request.body) } : {})
        })
        const response = await auth.handler(req)
        reply.status(response.status)
        response.headers.forEach((value, key) => {
          reply.header(key, value)
        })
        reply.send(response.body ? await response.text() : null)
      } catch {
        app.log.error('Authentication Error')
        reply.status(500).send({
          error: 'Internal authentication error',
          code: 'AUTH_FAILURE'
        })
      }
    }
  })
}
