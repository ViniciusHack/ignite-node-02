import cookie from '@fastify/cookie'
import fastify from 'fastify'
import { transactionRoutes } from './routes/transactions'

const app = fastify()

app.register(cookie)

app.register(transactionRoutes, {
  prefix: 'transactions',
})

app.listen({ port: 3333 }).then(() => {
  console.log(`> Ready on http://localhost:3333`)
})
