import { Queue } from "bullmq";
import { createRedisConnection } from "./redis";

export const VIDEO_QUEUE_NAME = "video-processing";

export const videoQueue = new Queue(VIDEO_QUEUE_NAME, {
  connection: createRedisConnection(),
});

export interface VideoJobData {
  videoId: string;
  rawKey: string;
}