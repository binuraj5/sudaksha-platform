/**
 * Redis Client Singleton + JSON Cache Utilities
 * SEPL/INT/2026/IMPL-GAPS-01 Step G19
 * Patent claim C-09 — session management and analytics caching infrastructure
 *
 * Used for:
 *   • Workforce Readiness Index (WRI) caching — 1-hour TTL
 *   • Future Intelligence Signals caching — 24-hour TTL
 *   • Future use: assessment session checkpointing, rate-limit counters
 *
 * Connection strategy:
 *   • Single global singleton — survives Next.js HMR in dev, deduped across
 *     route handler invocations in production.
 *   • lazyConnect: true — does not open a TCP connection until first command.
 *     This means a missing/unhealthy Redis won't crash app boot.
 *   • enableOfflineQueue: false — commands fail fast instead of buffering
 *     forever; failures are caught silently by cacheGet/cacheSet/cacheDel.
 *
 * Configure via REDIS_URL env var. If unset, defaults to localhost:6379.
 *
 * Add to .env.example / .env:
 *   REDIS_URL=redis://localhost:6379
 */

import Redis from 'ioredis';

const globalForRedis = globalThis as unknown as { redis?: Redis };

export const redis: Redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
    lazyConnect: true,
    enableOfflineQueue: false,
    // ioredis defaults to 20 retries — cap aggressively so a missing Redis
    // doesn't keep producing reconnect noise in logs.
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      if (times > 3) return null; // give up reconnecting after 3 attempts
      return Math.min(times * 200, 2000);
    },
  });

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

// Suppress connection-error noise — these are expected when Redis is offline.
// We swallow them at call sites already; logging here would just spam.
redis.on('error', () => { /* silent: handled by cacheGet/cacheSet wrappers */ });

/**
 * Retrieves a JSON-serialised value at `key`. Returns null on miss, parse error,
 * or any Redis transport failure (Redis offline, command timeout, etc.).
 *
 * Anti-pattern guard: never throws — callers can `await cacheGet(...)` without
 * needing a try/catch. Cache is opportunistic, not load-bearing.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const v = await redis.get(key);
    if (!v) return null;
    return JSON.parse(v) as T;
  } catch {
    return null;
  }
}

/**
 * Stores `value` JSON-serialised at `key` with the given TTL in seconds.
 * Silently fails if Redis is unavailable. ttlSeconds must be > 0.
 */
export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds: number,
): Promise<void> {
  if (!Number.isFinite(ttlSeconds) || ttlSeconds <= 0) return;
  try {
    await redis.set(key, JSON.stringify(value), 'EX', Math.floor(ttlSeconds));
  } catch {
    /* silent — caching is opportunistic */
  }
}

/**
 * Deletes a single key (or multiple keys). Silent on failure.
 */
export async function cacheDel(...keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  try {
    await redis.del(...keys);
  } catch {
    /* silent */
  }
}

/**
 * Best-effort namespaced key helper to avoid collisions across features.
 * Example: cacheKey('wri', tenantId) → "sudaksha:wri:abc123"
 */
export function cacheKey(...parts: Array<string | number>): string {
  return ['sudaksha', ...parts].join(':');
}
