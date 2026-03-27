'use strict'

// Benchmark: Fastify startup time with ata-validator vs ajv
// Measures time from require() to server.ready()

const schemas = [
  // userSchema
  {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 100 },
      email: { type: 'string', format: 'email' },
      age: { type: 'integer', minimum: 0, maximum: 150 },
      role: { type: 'string', enum: ['admin', 'user', 'moderator'], default: 'user' },
      active: { type: 'boolean', default: true },
    },
    required: ['name', 'email'],
    additionalProperties: false,
  },
  // productSchema
  {
    type: 'object',
    properties: {
      title: { type: 'string', minLength: 1 },
      price: { type: 'number', minimum: 0 },
      currency: { type: 'string', enum: ['USD', 'EUR', 'TRY'], default: 'USD' },
      tags: { type: 'array', items: { type: 'string' }, maxItems: 10 },
      inStock: { type: 'boolean', default: true },
    },
    required: ['title', 'price'],
  },
  // searchSchema
  {
    type: 'object',
    properties: {
      query: { type: 'string', minLength: 1 },
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
      sort: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
    },
    required: ['query'],
  },
  // orderSchema
  {
    type: 'object',
    properties: {
      userId: { type: 'integer', minimum: 1 },
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            productId: { type: 'integer', minimum: 1 },
            quantity: { type: 'integer', minimum: 1, maximum: 99 },
          },
          required: ['productId', 'quantity'],
        },
        minItems: 1,
        maxItems: 50,
      },
      coupon: { type: 'string', pattern: '^[A-Z0-9]{4,10}$' },
      notes: { type: 'string', maxLength: 500 },
    },
    required: ['userId', 'items'],
  },
  // loginSchema
  {
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 8 },
      rememberMe: { type: 'boolean', default: false },
    },
    required: ['email', 'password'],
  },
]

async function benchAta(routeCount) {
  const fastify = require('fastify')({ logger: false })
  const fastifyAta = require('fastify-ata')

  const start = performance.now()
  await fastify.register(fastifyAta, { coerceTypes: true, removeAdditional: true })

  for (let i = 0; i < routeCount; i++) {
    const s = schemas[i % schemas.length]
    fastify.post(`/api/route-${i}`, { schema: { body: s } }, (req, reply) => {
      reply.send({ ok: true })
    })
  }

  await fastify.ready()
  const elapsed = performance.now() - start
  await fastify.close()
  return elapsed
}

async function benchAjv(routeCount) {
  const fastify = require('fastify')({ logger: false })

  const start = performance.now()

  for (let i = 0; i < routeCount; i++) {
    const s = schemas[i % schemas.length]
    fastify.post(`/ajv/route-${i}`, { schema: { body: s } }, (req, reply) => {
      reply.send({ ok: true })
    })
  }

  await fastify.ready()
  const elapsed = performance.now() - start
  await fastify.close()
  return elapsed
}

async function run() {
  console.log('==========================================================')
  console.log('  Fastify Startup Benchmark: ata-validator vs ajv')
  console.log('==========================================================\n')

  for (const routeCount of [5, 50, 100, 500]) {
    // warmup
    await benchAta(5)
    await benchAjv(5)

    const ataTime = await benchAta(routeCount)
    const ajvTime = await benchAjv(routeCount)
    const ratio = ajvTime / ataTime

    console.log(`  ${routeCount} routes:`)
    console.log(`    ata-validator:  ${ataTime.toFixed(2)}ms`)
    console.log(`    ajv (default):  ${ajvTime.toFixed(2)}ms`)
    console.log(`    ata is ${ratio.toFixed(1)}x faster\n`)
  }
}

run().catch(console.error)
