import { pgTable, pgEnum, uuid, varchar,text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const videoStatusEnum = pgEnum("video_status", [
  "pending",
  "processing",
  "ready",
  "failed",
]);

export const videos = pgTable("videos", {
    id: uuid("id").primaryKey().defaultRandom(),
    posterId: uuid("poster_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    videoName: varchar("video_name", { length: 255 }).notNull(),
    rawKey: text("raw_key").notNull(), // Caminho do vídeo no S3
    processedUrl: text("processed_url"), // preenchido só quando o worker termina (nullable)
    status: videoStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at").defaultNow().notNull()
})

/* 
Fluxo do upload e da transcodificação do vídeo


1. Cliente: "quero subir um vídeo chamado X"
   → POST /videos
   → servidor cria registro (status: pending), gera URL pré-assinada, retorna pro cliente

2. Cliente: usa a URL pra mandar o arquivo bruto DIRETO pro S3
   (servidor não participa dessa parte)

3. Cliente: "terminei de subir"
   → POST /videos/:id/complete
   → servidor muda status pra "processing", enfileira job no Redis

4. Worker (processo separado, rodando em background):
   → pega o job da fila
   → baixa o arquivo bruto do S3
   → roda ffmpeg pra converter
   → sobe o resultado processado de volta pro S3
   → atualiza o banco: status "ready", processedUrl preenchida

5. Cliente (em algum momento depois): pergunta "esse vídeo já está pronto?"
   → GET /videos/:id
   → se status for "ready", pode assistir

*/