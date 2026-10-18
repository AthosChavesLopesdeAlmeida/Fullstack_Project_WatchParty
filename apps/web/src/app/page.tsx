import Link from "next/link";
import { Crown, Lock, Play, Upload, Zap } from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Use your own videos",
    description:
      "Upload a file from your computer. It is converted automatically, so it plays in any browser.",
  },
  {
    icon: Zap,
    title: "Everyone stays in sync",
    description:
      "Play, pause and seek happen for the whole room at the same moment. Nobody has to ask where you are in the video.",
  },
  {
    icon: Crown,
    title: "The host holds the remote",
    description:
      "One person controls playback. If the host leaves, the room is handed over to someone else.",
  },
  {
    icon: Lock,
    title: "Only your friends get in",
    description:
      "Rooms and videos are private. People can join only if you invited them.",
  },
];

const steps = [
  {
    title: "Upload a video",
    description: "Pick a file from your computer and give it a name.",
  },
  {
    title: "Invite your friends",
    description: "Add friends, create a room and send them an invitation.",
  },
  {
    title: "Press play",
    description: "The host starts the video and everyone watches at the same time.",
  },
];

const participants = [
  { name: "joao (you)", host: true, online: true },
  { name: "maria", host: false, online: true },
  { name: "pedro", host: false, online: true },
  { name: "ana", host: false, online: false },
];

const primaryLink =
  "inline-flex h-11 items-center rounded-sm bg-blue-700 px-6 text-sm font-medium text-white transition-colors hover:bg-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400";

const secondaryLink =
  "inline-flex h-11 items-center rounded-sm border border-zinc-600 px-6 text-sm text-zinc-200 transition-colors hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400";

// Static picture of the room screen. It only shows what the product looks like.
function RoomPreview() {
  return (
    <div aria-hidden="true" className="relative mx-auto mt-14 w-full max-w-6xl px-6">
      {/* the screen casts light on the page, like a TV in a dark room */}
      <div className="absolute inset-x-16 -top-6 h-2/3 rounded-full bg-blue-600/25 blur-3xl" />

      <div className="relative overflow-hidden rounded-lg border border-zinc-700 bg-zinc-950">
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3 text-sm">
          <span className="text-zinc-200">Friday night movie</span>
          <span className="text-xs text-amber-400">You are the host</span>
        </div>

        <div className="grid md:grid-cols-[1fr_15rem]">
          <div className="relative flex aspect-video flex-col justify-end bg-black">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/25">
                <Play className="ml-1 h-7 w-7 text-white" />
              </span>
            </div>

            <p className="relative mx-auto mb-4 rounded-sm bg-black/70 px-3 py-1 text-center text-xs text-white sm:text-sm">
              Is everyone here? Okay, pressing play.
            </p>

            <div className="relative flex items-center gap-3 bg-zinc-900/80 px-4 py-3">
              <Play className="h-4 w-4 text-white" />
              <div className="h-1 flex-1 rounded-full bg-white/20">
                <div className="h-full w-1/3 rounded-full bg-blue-500" />
              </div>
              <span className="text-xs text-zinc-300">42:10 / 1:48:20</span>
            </div>
          </div>

          <div className="border-t border-zinc-800 p-4 text-left md:border-l md:border-t-0">
            <p className="mb-4 text-sm font-semibold text-zinc-200">Participants (3/4 online)</p>
            <ul className="flex flex-col gap-3">
              {participants.map((person) => (
                <li key={person.name} className="flex items-center gap-3">
                  <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-zinc-700 text-sm text-zinc-200">
                    {person.name[0].toUpperCase()}
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-zinc-950 ${person.online ? "bg-green-500" : "bg-zinc-500"}`}
                    />
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <span className={`truncate text-sm ${person.online ? "text-zinc-100" : "text-zinc-500"}`}>
                      {person.name}
                    </span>
                    {person.host && <span className="text-xs text-amber-400">Host</span>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-xl font-bold text-white">
          Watch Party
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/login" className="rounded-sm px-4 py-2 text-sm text-zinc-300 transition-colors hover:text-white">
            Log in
          </Link>
          <Link href="/register" className="rounded-sm bg-blue-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600">
            Register
          </Link>
        </nav>
      </header>

      <main>
        <section className="mx-auto w-full max-w-6xl px-6 pt-14 sm:pt-24">
          <h1 className="max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-6xl">
            Press play together, wherever you are.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-400">
            Upload a video, invite your friends to a room and watch it in sync. The host holds the remote, everyone else just enjoys the movie.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/register" className={primaryLink}>
              Create an account
            </Link>
            <Link href="/login" className={secondaryLink}>
              Log in
            </Link>
          </div>
        </section>

        <RoomPreview />

        <section className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-28 md:grid-cols-[1fr_2fr]">
          <h2 className="text-2xl font-bold text-white md:sticky md:top-8 md:self-start">
            Made for one thing: watching together.
          </h2>
          <ul className="divide-y divide-zinc-700 border-y border-zinc-700">
            {features.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex gap-4 py-6">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
                <div>
                  <h3 className="font-semibold text-white">{title}</h3>
                  <p className="mt-1 max-w-prose text-sm leading-relaxed text-zinc-400">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-t border-zinc-800 bg-zinc-950/40">
          <div className="mx-auto w-full max-w-6xl px-6 py-24">
            <h2 className="text-2xl font-bold text-white">From file to movie night in three steps</h2>
            <ol className="mt-10 grid gap-10 md:grid-cols-3">
              {steps.map((step, index) => (
                <li key={step.title}>
                  <span className="text-3xl font-bold text-zinc-600">{index + 1}</span>
                  <h3 className="mt-3 font-semibold text-white">{step.title}</h3>
                  <p className="mt-1 max-w-xs text-sm leading-relaxed text-zinc-400">{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-6 px-6 py-24 sm:flex-row sm:items-center">
          <h2 className="max-w-md text-2xl font-bold text-white">Ready to start your first room?</h2>
          <Link href="/register" className={primaryLink}>
            Create an account
          </Link>
        </section>
      </main>

      <footer className="border-t border-zinc-800">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 text-sm text-zinc-500">
          <span>Watch Party</span>
          <span>{new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}