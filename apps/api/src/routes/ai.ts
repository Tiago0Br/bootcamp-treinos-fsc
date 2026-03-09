import { google } from '@ai-sdk/google'
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage
} from 'ai'
import { fromNodeHeaders } from 'better-auth/node'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { WeekDay } from '../generated/prisma/enums.js'
import { auth } from '../lib/auth.js'
import { CreateWorkoutPlan } from '../use-cases/create-workout-plan.js'
import { GetUserTrainData } from '../use-cases/get-user-train-data.js'
import { ListWorkoutPlans } from '../use-cases/list-workout-plans.js'
import { UpsertUserTrainData } from '../use-cases/upsert-user-train-data.js'
import { AI_PROMPT } from '../utils/ai-prompt.js'

export async function aiRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/',
    {
      schema: {
        operationId: 'chatWithAI',
        tags: ['AI'],
        summary: 'Chat with AI personal trainer'
      }
    },
    async (request, reply) => {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(request.headers)
      })

      if (!session) {
        return reply.status(401).send({ error: 'Unauthorized' })
      }

      const userId = session.user.id
      const { messages } = request.body as { messages: UIMessage[] }

      const result = streamText({
        model: google('gemini-2.5-flash'),
        system: AI_PROMPT,
        messages: await convertToModelMessages(messages),
        stopWhen: stepCountIs(10),
        tools: {
          getUserTrainData: tool({
            description:
              'Busca os dados de treino do usuário autenticado (peso, altura, idade, % gordura). Retorna null se não houver dados cadastrados.',
            inputSchema: z.object({}),
            execute: async () => {
              const getUserTrainData = new GetUserTrainData()
              return getUserTrainData.execute({ userId })
            }
          }),
          updateUserTrainData: tool({
            description:
              'Atualiza os dados de treino do usuário autenticado. O peso deve ser em gramas (converter kg * 1000).',
            inputSchema: z.object({
              weightInGrams: z
                .number()
                .describe('Peso do usuário em gramas (ex: 70kg = 70000)'),
              heightInCentimeters: z
                .number()
                .describe('Altura do usuário em centímetros'),
              age: z.number().describe('Idade do usuário'),
              bodyFatPercentage: z
                .number()
                .int()
                .min(0)
                .max(100)
                .describe('Percentual de gordura corporal (0 a 100)')
            }),
            execute: async (params) => {
              const upsertUserTrainData = new UpsertUserTrainData()
              return upsertUserTrainData.execute({ userId, ...params })
            }
          }),
          getWorkoutPlans: tool({
            description:
              'Lista todos os planos de treino do usuário autenticado.',
            inputSchema: z.object({}),
            execute: async () => {
              const listWorkoutPlans = new ListWorkoutPlans()
              return listWorkoutPlans.execute({ userId })
            }
          }),
          createWorkoutPlan: tool({
            description:
              'Cria um novo plano de treino completo para o usuário.',
            inputSchema: z.object({
              name: z.string().describe('Nome do plano de treino'),
              workoutDays: z
                .array(
                  z.object({
                    name: z
                      .string()
                      .describe('Nome do dia (ex: Peito e Tríceps, Descanso)'),
                    weekDay: z.enum(WeekDay).describe('Dia da semana'),
                    isRest: z
                      .boolean()
                      .describe(
                        'Se é dia de descanso (true) ou treino (false)'
                      ),
                    estimatedDurationInSeconds: z
                      .number()
                      .describe(
                        'Duração estimada em segundos (0 para dias de descanso)'
                      ),
                    coverImageUrl: z
                      .string()
                      .url()
                      .describe(
                        'URL da imagem de capa do dia de treino. Usar as URLs de superior ou inferior conforme o foco muscular do dia.'
                      ),
                    exercices: z
                      .array(
                        z.object({
                          order: z
                            .number()
                            .describe('Ordem do exercício no dia'),
                          name: z.string().describe('Nome do exercício'),
                          sets: z.number().describe('Número de séries'),
                          reps: z.number().describe('Número de repetições'),
                          restTimeInSeconds: z
                            .number()
                            .describe(
                              'Tempo de descanso entre séries em segundos'
                            )
                        })
                      )
                      .describe(
                        'Lista de exercícios (vazia para dias de descanso)'
                      )
                  })
                )
                .describe(
                  'Array com exatamente 7 dias de treino (MONDAY a SUNDAY)'
                )
            }),
            execute: async (input) => {
              const createWorkoutPlan = new CreateWorkoutPlan()
              return createWorkoutPlan.execute({
                userId,
                name: input.name,
                workoutDays: input.workoutDays
              })
            }
          })
        }
      })

      const response = result.toUIMessageStreamResponse()
      reply.status(response.status)
      response.headers.forEach((value, key) => {
        reply.header(key, value)
      })
      return reply.send(response.body)
    }
  )
}
