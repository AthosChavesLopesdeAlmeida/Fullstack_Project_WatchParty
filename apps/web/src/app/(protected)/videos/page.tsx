import type { ComponentProps } from "react";
import { serverFetch } from "@/lib/server-api";

import {  
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
} from '@/components/ui/card'

import UploadVideoForm from './UploadVideoForm'
import VideosList from './VideosList'

type Videos = ComponentProps<typeof VideosList>["initialVideos"];

const Page = async () => {
  const res = await serverFetch<{ videos: Videos } | Videos>("/videos");
  const videos: Videos = Array.isArray(res.data) ? res.data : (res.data?.videos ?? []);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-800 p-4 gap-4">
        <header className='flex flex-row items-center justify-between text-white'>
            <h1 className='font-bold text-2xl'>Watch Party</h1>

            <div className='flex flex-row gap-4'>
                <a href="/rooms" className='opacity-40 hover:opacity-100 transition-all duration-300'>Rooms</a>
                <a href="/friends" className='opacity-40 hover:opacity-100 transition-all duration-300'>Friends</a>
                <a href="/videos" className='border-b-1 hover:border-b-2 transition-all duration-300'>Videos</a>
                <a href="/profile" className='opacity-40 hover:opacity-100 transition-all duration-300'>Profile</a>
                <a href="/inbox" className='opacity-40 hover:opacity-100 transition-all duration-300'>Inbox</a>
            </div>
        </header>

        <Card className="dark flex-1 rounded-sm">
            <CardHeader>
                <CardTitle className='text-3xl flex flex-row justify-between'>
                    Videos
                    <UploadVideoForm />
                </CardTitle>
                <CardDescription className='w-140'>
                    Here you can see all of the videos that you have uploaded. 
                    You want to upload a new video to watch with your friends?
                    Use the button 'Upload video' and select a file from your computer!
                </CardDescription>
            </CardHeader>
            <CardContent>
                <VideosList initialVideos={videos}/>
            </CardContent>
        </Card>
    </div>
  )
}

export default Page