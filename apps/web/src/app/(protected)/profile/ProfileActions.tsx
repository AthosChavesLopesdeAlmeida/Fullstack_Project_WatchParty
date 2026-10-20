"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

type User = {
  username: string
  email: string
  pfpUrl: string | null
  id: string
  createdAt: string
}

// same minimum as deleteSchema in packages/schemas
const MIN_PASSWORD_LENGTH = 8

const ProfileActions = () => {
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingUser, setIsFetchingUser] = useState(true)

  const [user, setUser] = useState<User | null>(null)

  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [password, setPassword] = useState("")
  const [deleteError, setDeleteError] = useState("")

  const router = useRouter()

  useEffect(() => {
    let cancelled = false

    async function fetchUser() {
      const response = await apiFetch<{ user: User }>("/auth/me")

      if (cancelled) return // component unmounted before the response arrived

      if (!response.ok || !response.data) {
        setError(
          response.errorType === "network"
            ? "Unable to connect to the server"
            : ((response.data as { error?: string } | null)?.error ?? "Error loading profile")
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

  const handleDeleteOpenChange = (open: boolean) => {
    if (isLoading) return // do not close while the request is running

    setIsDeleteOpen(open)

    if (!open) {
      setPassword("")
      setDeleteError("")
    }
  }

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault()
    setDeleteError("")
    setIsLoading(true)

    const response = await apiFetch("/auth/delete", {
      method: "DELETE",
      body: { password },
    })

    setIsLoading(false)

    if (!response.ok) {
      setDeleteError(
        response.errorType === "network"
          ? "Unable to connect to the server"
          : ((response.data as { error?: string } | null)?.error ?? "Error deleting account")
      )
      return
    }

    router.push("/")
  }

  const handleLogout = async () => {
    setError("")
    setIsLoading(true)

    const response = await apiFetch("/auth/logout", {
      method: "POST",
    })

    setIsLoading(false)

    if (!response.ok) {
      setError(
        response.errorType === "network"
          ? "Unable to connect to the server"
          : ((response.data as { error?: string } | null)?.error ?? "Error logging out")
      )
      return
    }

    router.push("/")
  }

  return (
    <div className="flex flex-col h-[300px] w-[500px] rounded-sm bg-zinc-800 justify-center items-center gap-5">
      {isFetchingUser ? (
        <p>Loading...</p>
      ) : user ? (
        <>
          <Avatar className="w-14 h-14">
            <AvatarImage src={user.pfpUrl ?? undefined} />
            <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="flex flex-row gap-2">
            <p>{user.username}</p>
            <p>-</p>
            <p>{user.email}</p>
          </div>

          <p>Account created in {new Date(user.createdAt).toLocaleDateString("pt-BR")}</p>

          <div className="flex flex-row gap-4">
            <Button onClick={() => setIsDeleteOpen(true)} variant="destructive" className="cursor-pointer" disabled={isLoading}>
              Delete Account
            </Button>
            <Button onClick={handleLogout} variant="outline" className="cursor-pointer" disabled={isLoading}>
              Logout
            </Button>
          </div>
        </>
      ) : null}

      {error && <p className="text-red-500 text-sm font-bold">{error}</p>}

      <Dialog open={isDeleteOpen} onOpenChange={handleDeleteOpenChange}>
        <DialogContent className="dark">
          <form onSubmit={handleDelete} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Delete your account?</DialogTitle>
              <DialogDescription>
                This permanently deletes your account and everything linked to it, like your videos, rooms and friendships. This action cannot be undone. Type your password to confirm.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-2">
              <label htmlFor="delete-password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="delete-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {deleteError && <p className="text-red-500 text-sm font-bold">{deleteError}</p>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleDeleteOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={isLoading || password.length < MIN_PASSWORD_LENGTH}>
                {isLoading ? "Deleting..." : "Delete account"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ProfileActions