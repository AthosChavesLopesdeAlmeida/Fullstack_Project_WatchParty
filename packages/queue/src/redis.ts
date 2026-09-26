import { Redis } from "ioredis"

export function createRedisConnection() {
    return new Redis(process.env.REDIS_URL!, {
        maxRetriesPerRequest: null
    })
}