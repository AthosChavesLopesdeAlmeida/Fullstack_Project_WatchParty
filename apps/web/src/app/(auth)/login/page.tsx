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

  const [error, setError] = useState('')
  const [isLoading, setIsloading] = useState(false)

  const router = useRouter()

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault()
    setError('')
    setIsloading(true)

    const response = await apiFetch<{ user: { id: string; username: string } }>("/auth/login", { 
        method: "POST", 
        body: { email, password } 
      });

    setIsloading(false)
    
    if (!response.ok) {
      if (response.errorType === "network") {
        setError("Unable to connect to the server");
        setIsloading(false)
      } else {
        setError((response.data as any)?.error ?? "Error logging in");
        setIsloading(false)
      }
      return;
    }
    router.push("/rooms");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-800">
      <Card className="dark h-[380px] w-[400px] rounded-sm">
        
        <CardHeader>
          <CardTitle className="text-2xl">Log in</CardTitle>
          <CardDescription>Insert your data &#40;password and email&#41; to log into your account</CardDescription>
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

              <div className="flex flex-col gap-3 text-center">
                <Button type="submit" variant={"default"} className="cursor-pointer" disabled={isLoading}>Submit</Button>
                <Button type="submit" variant={"secondary"} onClick={() => router.push('/register')} className="cursor-pointer">Don't have an account? register here</Button>
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