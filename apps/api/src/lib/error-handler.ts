import type { FastifyReply, FastifyRequest } from 'fastify'
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  WorkoutPlanNotActiveError
} from '../errors/index.js'

type HttpError = Error & { statusCode?: number }

export const errorHandler = (
  error: HttpError,
  request: FastifyRequest,
  reply: FastifyReply
): void => {
  if (error.statusCode === 400) {
    reply.status(400).send({
      error: error.message,
      code: 'VALIDATION_ERROR'
    })
    return
  }

  if (error instanceof NotFoundError) {
    reply.status(404).send({ error: error.message, code: 'NOT_FOUND' })
    return
  }

  if (error instanceof UnauthorizedError) {
    reply.status(403).send({ error: error.message, code: 'FORBIDDEN' })
    return
  }

  if (error instanceof WorkoutPlanNotActiveError) {
    reply
      .status(422)
      .send({ error: error.message, code: 'WORKOUT_PLAN_NOT_ACTIVE' })
    return
  }

  if (error instanceof ConflictError) {
    reply.status(409).send({ error: error.message, code: 'CONFLICT' })
    return
  }

  request.log.error(error)
  reply.status(500).send({
    error: 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR'
  })
}
