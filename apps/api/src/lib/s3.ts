import { S3Client, DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const s3 = new S3Client({
  region: "auto", // R2 não usa regiões como a AWS — "auto" é o valor esperado
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME!;

export async function generatePresignedUploadUrl(key: string) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });
  return getSignedUrl(s3, command, { expiresIn: 60 * 5 });
}

export async function deleteObject(key: string) {
  const command = new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: key });
  await s3.send(command);
}


/**
 * Fluxo de upload de vídeo via R2 (URL pré-assinada)
 * ----------------------------------------------------
 * O Express nunca recebe os bytes do vídeo — ele só autoriza e reage.
 *
 * 1. Cliente pede pra criar um vídeo (POST /videos, só com o nome).
 * 
 * 2. Servidor gera uma `key` única (rawKey) e chama generatePresignedUploadUrl,
 *    que retorna uma URL temporária (expira em alguns minutos) autorizando
 *    um PUT direto nessa key do bucket R2, sem expor as credenciais.
 * 
 * 3. Servidor devolve { video, uploadUrl } pro cliente. O arquivo AINDA não
 *    existe no R2 nesse momento — só reservamos onde ele vai morar.
 * 
 * 4. Front end faz o upload de verdade (fetch PUT com o File do input),
 *    direto pro R2 — esse tráfego não passa pelo nosso servidor.
 * 
 * 5. Cliente confirma que terminou (POST /videos/:id/complete). O R2 não
 *    avisa o servidor sozinho quando o upload termina, por isso essa
 *    confirmação é manual. O servidor marca status "processing" e enfileira
 *    o job de transcodificação (BullMQ).
 * 
 * 6. Worker baixa o arquivo bruto (rawKey) via GetObjectCommand, processa
 *    com ffmpeg, e sobe o resultado processado numa key separada.
 * 
 * 7. deleteObject remove arquivos do bucket (usado tanto pro raw quanto pro
 *    processado, quando o vídeo é excluído).
 *
 * R2 é compatível com a API do S3 — usamos o mesmo SDK da AWS, só apontando
 * pra um endpoint diferente. Diferente do S3, o R2 não cobra taxa de saída
 * de dados (egress), o que é relevante pra um app de streaming de vídeo.
 *
 * Credenciais (.env): R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
 * R2_BUCKET_NAME — geradas no painel do Cloudflare (R2 > Manage API Tokens),
 * nunca compartilhadas ou commitadas no repositório.
 */