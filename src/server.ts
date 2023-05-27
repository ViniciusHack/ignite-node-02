import fastify from 'fastify'

const app = fastify({})

app.listen({ port: 3333 }).then(() => {
  console.log(`> Ready on http://localhost:3333`)
})
