ALTER TABLE "rooms" DROP CONSTRAINT "rooms_current_video_id_videos_id_fk";
--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_current_video_id_videos_id_fk" FOREIGN KEY ("current_video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;