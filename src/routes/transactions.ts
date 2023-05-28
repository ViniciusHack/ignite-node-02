import { FastifyInstance } from 'fastify'
import crypto from 'node:crypto'
import { z } from 'zod'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

const createTransactionBodySchema = z.object({
  type: z.enum(['credit', 'debit']),
  amount: z.number(),
  title: z.string(),
})

const getTransactionParamsSchema = z.object({
  id: z.string().uuid(),
})

export async function transactionRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, reply) => {
      const { sessionId } = req.cookies

      const transactions = await knex('transactions')
        .where({
          session_id: sessionId,
        })
        .select()
      return {
        transactions,
      }
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, reply) => {
      const { sessionId } = req.cookies

      const { id } = getTransactionParamsSchema.parse(req.params)
      const transaction = await knex('transactions')
        .where({
          session_id: sessionId,
          id,
        })
        .first()
      return {
        transaction,
      }
    },
  )

  app.get(
    '/summary',
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, reply) => {
      const { sessionId } = req.cookies

      const summary = await knex('transactions')
        .where({
          session_id: sessionId,
        })
        .sum('amount', { as: 'amount' })
        .first()

      return {
        summary,
      }
    },
  )

  app.post('/', async (req, reply) => {
    const body = createTransactionBodySchema.parse(req.body)

    let sessionId = req.cookies.sessionId

    if (!sessionId) {
      sessionId = crypto.randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('transactions').insert({
      id: crypto.randomUUID(),
      title: body.title,
      amount: body.type === 'credit' ? body.amount : body.amount * -1,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })
}
