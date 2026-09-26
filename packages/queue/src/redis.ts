import { Redis } from "ioredis"

export function createRedisConnection() {
    return new Redis(process.env.REDIS_URL!, {
        maxRetriesPerRequest: null
    })
}

/**
 * Papel do Redis neste projeto
 * -----------------------------
 * Redis é um banco de dados em memória, usado aqui como o "motor" por trás
 * da fila de processamento de vídeo (via BullMQ). Diferente do Postgres
 * (pensado pra consultas relacionais e durabilidade), o Redis é otimizado
 *  para operações simples e extremamente rápidas — ideal pro padrão de fila:
 * "pegue o próximo job, marque como em processamento, repita".
 *
 * Quando o servidor Express adiciona um job (videoQueue.add), o BullMQ
 * grava isso em estruturas de dados dentro do Redis. Esses dados persistem
 * mesmo que o Express reinicie — o worker, um processo separado, continua
 * enxergando os jobs pendentes e os consome de forma independente.
 * 
 */