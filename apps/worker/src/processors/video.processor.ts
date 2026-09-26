import { Worker } from "bullmq";
import ffmpeg from "fluent-ffmpeg";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { VIDEO_QUEUE_NAME, VideoJobData, createRedisConnection } from "@watch-party/queue";
import { videosRepository } from "@watch-party/db";
import { downloadObject, uploadObject } from "../lib/s3";

export const videoWorker = new Worker<VideoJobData>(
    VIDEO_QUEUE_NAME,
    async (job) => {
        const { videoId, rawKey } = job.data;
        const tempInput = path.join(os.tmpdir(), `${videoId}-raw`);
        const tempOutput = path.join(os.tmpdir(), `${videoId}-processed.mp4`);

        try {
            // 1. baixa o arquivo bruto do R2 pra um arquivo temporário local
            const stream = await downloadObject(rawKey);
            await new Promise((resolve, reject) => {
                const writeStream = fs.createWriteStream(tempInput);
                stream.pipe(writeStream).on("finish", resolve).on("error", reject);
            });

            // 2. transcodifica com ffmpeg
            await new Promise((resolve, reject) => {
                ffmpeg(tempInput)
                .output(tempOutput)
                .videoCodec("libx264")
                .audioCodec("aac")
                .on("end", resolve)
                .on("error", reject)
                .run();
            });

            // 3. sobe o resultado processado pro R2
            const processedKey = `${rawKey}-processed.mp4`;
            const processedUrl = await uploadObject(processedKey, fs.readFileSync(tempOutput));

            // 4. Atualiza o banco diretamente pelo videosRepository
            await videosRepository.markAsReady(videoId, processedUrl)
        } catch (error) {
            await videosRepository.markAsFailed(videoId)
            throw error
        } finally {
            // Limpa os arquivos temporários que foram criados durante o processamento
            fs.existsSync(tempInput) && fs.unlinkSync(tempInput)
            fs.existsSync(tempOutput) && fs.unlinkSync(tempOutput)
        }
    },
    { connection: createRedisConnection() }
)

videoWorker.on("completed", (job) => console.log(`Video ${job.data.videoId} processed`))
videoWorker.on("failed", (job, err) => console.error(`Video ${job?.data.videoId} failed`))