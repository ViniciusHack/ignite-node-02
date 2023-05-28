import { app } from './app'
import { env } from './env'

app.listen({ port: env.PORT }).then(() => {
  console.log(`> Ready on http://localhost:3333`)
})
