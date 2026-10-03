'use client'

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen min-w-screen bg-zinc-800">
      <Button onClick={() => router.push('/login')}>Login</Button>
      <Button onClick={() => router.push('/register')}>Register</Button>
    </div>
  );
}
