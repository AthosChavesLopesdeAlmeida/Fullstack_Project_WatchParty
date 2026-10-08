"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"

import { Button } from "@/components/ui/button"
import {
    Avatar,
    AvatarImage,
    AvatarFallback,
} from  "@/components/ui/avatar"

type User = {
    username: string,
    email: string,
    pfpUrl: string,
    id: string,
    createdAt: string
}

const ProfileActions = () => {
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingUser, setIsFetchingUser] = useState(true)

  const [user, setUser] = useState<User | null>()
  const [password, setPassword] = useState('')

  const router = useRouter()


    useEffect(() => {
    let cancelled = false

    async function fetchUser() {
        const response = await apiFetch<{ user: User }>("/auth/me")

        if (cancelled) return // componente desmontou antes da resposta chegar

        if (!response.ok || !response.data) {
        setError(
            response.errorType === "network"
            ? "Unable to connect to the server"
            : (response.data as any)?.error ?? "Error loading profile"
        )
        } else {
        setUser(response.data.user)
        }

        setIsFetchingUser(false)
    }

    fetchUser()

    return () => {
        cancelled = true
    }
    }, [])

  const handleDelete = async () => {
    setError('')
    setIsLoading(true)

    const response = await apiFetch<{ user: { id: string } }>("/auth/delete", {
        method: "DELETE",
        body: {password}
    })

    setIsLoading(false)

    if (!response.ok) {
      if (response.errorType === "network") {
        setError("Unable to connect to the server");
        setIsLoading(false)
      } else {
        setError((response.data as any)?.error ?? "Error deleting account");
        setIsLoading(false)
      }
      return;
    }

    router.push("/")
  }

  const handleLogout = async () => {
    setError('')
    setIsLoading(true)

    const response = await apiFetch<{ user: { id: string } }>("/auth/logout", {
        method: "POST",
    })

    setIsLoading(false)

    if (!response.ok) {
      if (response.errorType === "network") {
        setError("Unable to connect to the server");
        setIsLoading(false)
      } else {
        setError((response.data as any)?.error ?? "Error deleting account");
        setIsLoading(false)
      }
      return;
    }

    router.push("/")
  }

  return (
    <div className="flex flex-col h-[300px] w-[500px] rounded-sm bg-zinc-800 justify-center items-center">
        {isFetchingUser ? (
            <p>Loading...</p>
        ) : user ? (
            <>
            <Avatar>
                <AvatarImage src={user.pfpUrl} />
                <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <p>{user.username}</p>
            <p>{user.email}</p>
            <p>Member since {new Date(user.createdAt).toLocaleDateString("pt-BR")}</p>

            <div className="flex flex-row gap-4">
                <Button onClick={() => handleDelete()} variant="destructive" className="w-[50px]" disabled={isLoading}>Delete Account</Button>
                <Button onClick={() => handleLogout()} variant="outline" className="w-[50px]" disabled={isLoading}>Logout</Button>
            </div>
            </>
        ) : null}
        {error && <p className="text-red-500 text-sm font-bold">{error}</p>}
    </div>
  )
}

export default ProfileActions