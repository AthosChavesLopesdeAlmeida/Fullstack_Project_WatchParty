'use client'
import { apiFetch } from "@/lib/api"
import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

import {  
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card"

const Page = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [pfp, setPfp] = useState('')

  const [error, setError] = useState('')
  const [isLoading, setIsloading] = useState(false)

  const router = useRouter()

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault()
    setError('')
    setIsloading(true)

    const response = await apiFetch<{ user: { id: string; username: string } }>("/auth/register", { 
        method: "POST", 
        body: { email, username, password, pfp } 
      });

    setIsloading(false)
    
    if (!response.ok) {
      if (response.errorType === "network") {
        setError("Unable to connect to the server");
        setIsloading(false)
      } else {
        setError((response.data as any)?.error ?? "Error registering account");
        setIsloading(false)
      }
      return;
    }

    router.push("/rooms");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-800">
      <Card className="dark h-[530px] w-[400px] rounded-sm">
        
        <CardHeader>
          <CardTitle className="text-2xl">Create account</CardTitle>
          <CardDescription>Insert your data &#40;password, email, username and profile picture URL&#41; to create an account</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={(e) => handleSubmit(e)}>
            <div className="flex flex-col gap-6">              
              <div className="flex flex-col gap-3">
                <Label htmlFor="email">Email</Label>
                <Input required id="email" name="email" onChange={(e) => setEmail(e.target.value)} type="email" placeholder="example@gmail.com"></Input>
              </div>

              <div className="flex flex-col gap-3">
                <Label htmlFor="password">Password</Label>
                <Input min={8} required id="password" name="password" onChange={(e) => setPassword(e.target.value)} type="password"></Input>
              </div>
          
              <div className="flex flex-col gap-3">
                <Label htmlFor="username">Username</Label>
                <Input min={3} max={50} required id="username" name="username" onChange={(e) => setUsername(e.target.value)} type="text"></Input>
              </div>

              <div className="flex flex-col gap-3">
                <Label htmlFor="username">PFP URL</Label>
                <Input required id="username" name="username" onChange={(e) => setPfp(e.target.value)} type="text"></Input>
              </div>

              <div className="flex flex-col gap-3 text-center">
                <Button type="submit" variant={"default"} className="cursor-pointer" disabled={isLoading}>Submit</Button>
                <Button type="submit" variant={"secondary"} onClick={() => router.push('/login')} className="cursor-pointer">Already have an account? Log in here</Button>
                {error && <p className="text-red-500 font-bold text-[15px]">{error}</p>}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Page