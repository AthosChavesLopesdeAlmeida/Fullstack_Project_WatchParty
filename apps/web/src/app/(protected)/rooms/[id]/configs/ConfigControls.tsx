"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Crown, LogOut, Trash2, UserMinus, Video, AlertTriangle, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { apiFetch } from "@/lib/api"
import type { RoomMember } from "../ParticipantsSidebar"

type Props = {
  roomId: string
  hostId: string
  currentUserId: string
  currentVideoId: string | null
  members: RoomMember[]
}

type Video = { id: string; title: string }

type ApiResult = {
  data: unknown
  status: number
  ok: boolean
  errorType?: "network" | "parse" | "none"
}

const getErrorMessage = (res: ApiResult): string => {
  if (res.errorType === "network") return "Could not reach the server"
  if (res.errorType === "parse") return "Unexpected response from the server"

  const body = res.data as { error?: string; message?: string } | null
  if (body?.error) return body.error
  if (body?.message) return body.message

  if (res.status === 401) return "You need to log in again"
  if (res.status === 403) return "You don't have permission to do this"
  if (res.status === 404) return "Not found"
  return "Something went wrong"
}

// Cartão padrão reutilizado nas seções
const Panel = ({
  title,
  description,
  icon,
  danger,
  children,
}: {
  title: string
  description?: string
  icon?: React.ReactNode
  danger?: boolean
  children: React.ReactNode
}) => (
  <section
    className={`rounded-lg border p-5 flex flex-col gap-4 ${
      danger ? "border-red-900/60 bg-red-950/20" : "border-zinc-800 bg-zinc-900/50"
    }`}
  >
    <div className="flex items-start gap-3">
      {icon && <div className={`mt-0.5 ${danger ? "text-red-400" : "text-zinc-400"}`}>{icon}</div>}
      <div>
        <h2 className="font-semibold text-lg text-white leading-tight">{title}</h2>
        {description && <p className="text-sm text-zinc-400 mt-1">{description}</p>}
      </div>
    </div>
    {children}
  </section>
)


const ConfigControls = ({ roomId, hostId, currentUserId, currentVideoId, members }: Props) => {
  const router = useRouter()
  const isHost = currentUserId === hostId

  const [participants, setParticipants] = useState(members)
  const [videos, setVideos] = useState<Video[]>([])
  const [invitedEmail, setInvitedEmail] = useState('')
  const [videosLoaded, setVideosLoaded] = useState(false)
  const [videoId, setVideoId] = useState(currentVideoId ?? "")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isHost) return
    apiFetch<{ videos: Video[] }>("/videos").then((res) => {
      if (res.ok && res.data) setVideos(res.data.videos)
      setVideosLoaded(true)
    })
  }, [isHost])

  const exitRoom = async () => {
    const res = await apiFetch(`/rooms/${roomId}/leave`, { method: "POST" })
    if (!res.ok) return setError(getErrorMessage(res))
    router.push("/rooms")
  }

  const kick = async (userId: string) => {
    const res = await apiFetch(`/rooms/${roomId}/participants/${userId}`, { method: "DELETE" })
    if (!res.ok) return setError(getErrorMessage(res))
    setError(null)
    setParticipants((prev) => prev.filter((m) => m.userId !== userId))
  }

  const changeVideo = async () => {
    const res = await apiFetch(`/rooms/${roomId}`, {
      method: "PATCH",
      body: { currentVideoId: videoId || null },
    })
    if (!res.ok) return setError(getErrorMessage(res))
    setError(null)
    router.refresh()
  }

  const deleteRoom = async () => {
    if (!confirm("Delete this room? This cannot be undone.")) return
    const res = await apiFetch(`/rooms/${roomId}`, { method: "DELETE" })
    if (!res.ok) return setError(getErrorMessage(res))
    router.push("/rooms")
  }

  const inviteUser = async (invitedEmail: string) => {
    const res = await apiFetch(`/rooms/${roomId}/invite`, {
      method: "POST",
      body: { invitedEmail },
    })
    if (!res.ok) return setError(getErrorMessage(res))
    setError(null)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl text-white">
      {error && (
        <div className="flex items-center gap-2 rounded-md border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      <div className={`grid gap-6 items-start ${isHost ? "lg:grid-cols-2" : "grid-cols-1"}`}>
        {/* Participants */}
        <Panel
          title={`Participants (${participants.length})`}
          description={isHost ? "You can remove people from the room." : "People watching with you."}
        >
          <ul className="flex flex-col divide-y divide-zinc-800 rounded-md border border-zinc-800 bg-zinc-950/40">
            {participants.map((m) => (
              <li key={m.userId} className="flex items-center gap-3 px-3 py-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-sm font-semibold uppercase">
                  {m.username.charAt(0)}
                </div>

                <span className="flex-1 truncate text-sm">
                  {m.username}
                  {m.userId === currentUserId && <span className="ml-2 text-zinc-500">(you)</span>}
                </span>

                {m.userId === hostId && (
                  <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs text-amber-400">
                    <Crown size={12} /> Host
                  </span>
                )}

                {isHost && m.userId !== currentUserId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="cursor-pointer text-red-400 hover:bg-red-950/50 hover:text-red-300"
                    onClick={() => kick(m.userId)}
                  >
                    <UserMinus size={16} />
                    Kick
                  </Button>
                )}
              </li>
            ))}
          </ul>

          <Button variant="destructive" className="cursor-pointer w-full" onClick={exitRoom}>
            <LogOut size={16} />
            Exit room
          </Button>
        </Panel>

        {/* Host */}
        {isHost && (
          <div className="flex flex-col gap-6">
            <Panel
              title="Current video"
              description="Change what everyone in the room is watching."
              icon={<Video size={20} />}
            >
              <div className="flex flex-col gap-3 sm:flex-row">
                <select
                  value={videoId}
                  onChange={(e) => setVideoId(e.target.value)}
                  disabled={!videosLoaded}
                  className="h-9 flex-1 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm outline-none focus:border-zinc-500 disabled:opacity-50"
                >
                  <option value="">{videosLoaded ? "No video" : "Loading videos..."}</option>
                  {videos.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.title}
                    </option>
                  ))}
                </select>

                <Button
                  className="cursor-pointer"
                  onClick={changeVideo}
                  disabled={!videosLoaded || videoId === (currentVideoId ?? "")}
                >
                  Save
                </Button>
              </div>
            </Panel>

            <Panel
              title="Invite others"
              description="Invite other users to the room using their email"
              icon={<Mail size={20} />}
            >
              <Input placeholder="example@email.com" type="email" required onChange={(e) => setInvitedEmail(e.target.value)}/>
              <Button className="bg-blue-800 hover:bg-blue-800 hover:opacity-70 text-white cursor-pointer w-full" onClick={() => inviteUser(invitedEmail)}>
                Invite user
              </Button>
            </Panel>

            <Panel
              danger
              title="Danger zone"
              description="Deleting the room removes it for everyone. This cannot be undone."
              icon={<Trash2 size={20} />}
            >
              <Button variant="destructive" className="cursor-pointer w-full" onClick={deleteRoom}>
                Delete room
              </Button>
            </Panel>

          </div>
        )}
      </div>
    </div>
  )
}

export default ConfigControls