import { cookies } from "next/headers";

import {  
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
} from '@/components/ui/card'

import UploadVideoForm from './UploadVideoForm'
import VideosList from './VideosList'

const Page = async () => {
    async function getVideos(token: string) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/videos`, {
            headers: { Cookie: `token=${token}` },
            cache: "no-store", // dados sempre atuais, nunca cacheados entre usuários diferentes
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.videos ?? data; 
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const videos = token ? await getVideos(token) : [];

  return (
    <div className="flex flex-col min-h-screen bg-zinc-800 p-4 gap-4">
        <header className='flex flex-row items-center justify-between text-white'>
            <h1 className='font-bold text-2xl'>Watch Party</h1>

            <div className='flex flex-row gap-4'>
                <a href="/rooms" className='opacity-40 hover:opacity-100 transition-all duration-300'>Rooms</a>
                <a href="/friends" className='opacity-40 hover:opacity-100 transition-all duration-300'>Friends</a>
                <a href="/videos" className='border-b-1 hover:border-b-2 transition-all duration-300'>Videos</a>
                <a href="/profile" className='opacity-40 hover:opacity-100 transition-all duration-300'>Profile</a>
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
                    Use the button 'Upload video' and use the video's URL to upload!
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