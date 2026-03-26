'use strict'

const fastify = require('fastify')({ logger: true })
const fastifyAta = require('fastify-ata')

// Register ata-validator as the schema validator
fastify.register(fastifyAta, {
  coerceTypes: true,
  removeAdditional: true,
})

// ============================================================
// Schemas
// ============================================================

const userSchema = {
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
}

const productSchema = {
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 1 },
    price: { type: 'number', minimum: 0 },
    currency: { type: 'string', enum: ['USD', 'EUR', 'TRY'], default: 'USD' },
    tags: { type: 'array', items: { type: 'string' }, maxItems: 10 },
    inStock: { type: 'boolean', default: true },
  },
  required: ['title', 'price'],
}

const searchSchema = {
  type: 'object',
  properties: {
    query: { type: 'string', minLength: 1 },
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
    sort: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
  },
  required: ['query'],
}

const orderSchema = {
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
}

const loginSchema = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 8 },
    rememberMe: { type: 'boolean', default: false },
  },
  required: ['email', 'password'],
}

// ============================================================
// Routes
// ============================================================

// Users
fastify.post('/api/users', {
  schema: { body: userSchema }
}, (req, reply) => {
  reply.send({ ok: true, user: req.body })
})

// Products
fastify.post('/api/products', {
  schema: { body: productSchema }
}, (req, reply) => {
  reply.send({ ok: true, product: req.body })
})

// Search
fastify.post('/api/search', {
  schema: { body: searchSchema }
}, (req, reply) => {
  reply.send({ ok: true, search: req.body })
})

// Orders
fastify.post('/api/orders', {
  schema: { body: orderSchema }
}, (req, reply) => {
  reply.send({ ok: true, order: req.body })
})

// Auth
fastify.post('/api/login', {
  schema: { body: loginSchema }
}, (req, reply) => {
  reply.send({ ok: true, login: { email: req.body.email, rememberMe: req.body.rememberMe } })
})

// Health
fastify.get('/health', (req, reply) => {
  reply.send({ status: 'ok', validator: 'ata-validator' })
})

// ============================================================
// Start
// ============================================================

fastify.listen({ port: 3000 }, (err) => {
  if (err) { fastify.log.error(err); process.exit(1) }
})
