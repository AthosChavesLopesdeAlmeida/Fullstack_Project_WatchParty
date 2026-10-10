import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { CrownIcon } from "@phosphor-icons/react/dist/ssr";

export type RoomMember = {
  userId: string;
  username: string;
  pfpUrl: string | null;
};

interface ParticipantsSidebarProps {
  members: RoomMember[];
  onlineIds: string[];
  hostId: string;
  currentUserId: string;
}

const ParticipantsSidebar = ({
  members,
  onlineIds,
  hostId,
  currentUserId,
}: ParticipantsSidebarProps) => {
  const online = new Set(onlineIds);
  const onlineCount = members.filter((m) => online.has(m.userId)).length;

  // host primeiro, depois quem está online, depois ordem alfabética
  const sorted = [...members].sort((a, b) => {
    if (a.userId === hostId) return -1;
    if (b.userId === hostId) return 1;
    const onlineDiff = Number(online.has(b.userId)) - Number(online.has(a.userId));
    if (onlineDiff !== 0) return onlineDiff;
    return a.username.localeCompare(b.username);
  });

  return (
    <aside className="w-64 shrink-0 bg-zinc-800 p-4 flex flex-col gap-3 overflow-y-auto">
      <h2 className="text-sm font-semibold">
        Participants ({onlineCount}/{members.length} online)
      </h2>

        <ul className="flex flex-col gap-3">
            {sorted.map((member) => {
            const isOnline = online.has(member.userId);

            return (
                <li key={member.userId} className="flex items-center gap-3">
                <div className="relative">
                    <Avatar>
                    <AvatarImage src={member.pfpUrl ?? undefined} alt={member.username} />
                    <AvatarFallback>{member.username[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span
                    aria-label={isOnline ? "Online" : "Offline"}
                    className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-zinc-800 ${
                        isOnline ? "bg-green-500" : "bg-zinc-500"
                    }`}
                    />
                </div>

                <div className="flex flex-col min-w-0">
                    <span className={`truncate text-sm ${isOnline ? "" : "text-zinc-500"}`}>
                    {member.username}
                    {member.userId === currentUserId && " (you)"}
                    </span>
                    {member.userId === hostId && (
                    <span className="text-xs text-amber-400">Host <CrownIcon/></span>
                    )}
                </div>
                </li>
            );
            })}
        </ul>
    </aside>
  )
}

export default ParticipantsSidebar