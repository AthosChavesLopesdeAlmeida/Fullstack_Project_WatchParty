// apps/worker/src/lib/s3.ts
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME!;

export async function downloadObject(key: string): Promise<NodeJS.ReadableStream> {
  const command = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key });
  const response = await s3.send(command);
  return response.Body as NodeJS.ReadableStream;
}

export async function uploadObject(key: string, body: Buffer) {
  const command = new PutObjectCommand({ Bucket: BUCKET_NAME, Key: key, Body: body });
  await s3.send(command);
  return `https://${process.env.R2_PUBLIC_URL}/${key}`;
}

/* 
  * Criei outro cliente do S3 em @watch-party/worker
  * pois ele também precisa fazer o download e upload dos arquivos de vídeo.
  * No futuro, talvez eu possa colocá-lo em um módulo separado, que serve tanto
  * @watch-party/worker quanto @watch-party/api, juntando todas as funções
*/