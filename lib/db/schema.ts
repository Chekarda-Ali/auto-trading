import { pgTable, text, timestamp, boolean, integer, jsonb, uuid, decimal } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  clerkId: text('clerk_id').unique().notNull(),
  email: text('email').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  imageUrl: text('image_url'),
  isAdmin: boolean('is_admin').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const subscriptions = pgTable('subscriptions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').references(() => users.id).notNull(),
  lemonSqueezyId: text('lemonsqueezy_id').unique().notNull(),
  status: text('status').notNull(), // active, cancelled, expired, past_due
  currentPeriodStart: timestamp('current_period_start').notNull(),
  currentPeriodEnd: timestamp('current_period_end').notNull(),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const exchangeCredentials = pgTable('exchange_credentials', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').references(() => users.id).notNull(),
  exchangeId: text('exchange_id').notNull(), // binance, kucoin, etc.
  apiKey: text('api_key').notNull(),
  apiSecret: text('api_secret').notNull(), // encrypted
  passphrase: text('passphrase'), // encrypted, for exchanges that need it
  sandbox: boolean('sandbox').default(false),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const botInstances = pgTable('bot_instances', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').references(() => users.id).notNull(),
  status: text('status').notNull(), // running, stopped, error
  settings: jsonb('settings'), // bot configuration
  startedAt: timestamp('started_at'),
  stoppedAt: timestamp('stopped_at'),
  lastHeartbeat: timestamp('last_heartbeat'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const trades = pgTable('trades', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').references(() => users.id).notNull(),
  botInstanceId: text('bot_instance_id').references(() => botInstances.id),
  exchangeId: text('exchange_id').notNull(),
  trianglePath: text('triangle_path').notNull(),
  initialAmount: decimal('initial_amount', { precision: 20, scale: 8 }).notNull(),
  finalAmount: decimal('final_amount', { precision: 20, scale: 8 }).notNull(),
  profitAmount: decimal('profit_amount', { precision: 20, scale: 8 }).notNull(),
  profitPercentage: decimal('profit_percentage', { precision: 10, scale: 6 }).notNull(),
  fees: decimal('fees', { precision: 20, scale: 8 }).notNull(),
  status: text('status').notNull(), // success, failed, partial
  executionTimeMs: integer('execution_time_ms'),
  errorMessage: text('error_message'),
  tradeData: jsonb('trade_data'), // detailed trade information
  createdAt: timestamp('created_at').defaultNow(),
});

export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').references(() => users.id),
  action: text('action').notNull(),
  resource: text('resource').notNull(),
  resourceId: text('resource_id'),
  metadata: jsonb('metadata'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const encryptionKeys = pgTable('encryption_keys', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  keyId: text('key_id').unique().notNull(),
  encryptedKey: text('encrypted_key').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  rotatedAt: timestamp('rotated_at'),
});

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type ExchangeCredential = typeof exchangeCredentials.$inferSelect;
export type BotInstance = typeof botInstances.$inferSelect;
export type Trade = typeof trades.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;