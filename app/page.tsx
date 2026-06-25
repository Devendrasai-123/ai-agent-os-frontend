import ControlPanel from "@/components/ControlPanel";
import { getHealth, getCurrentOutputs } from "@/lib/api";

export default async function Home() {
  const health = await getHealth();
  const outputs = await getCurrentOutputs();

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <h1 className="text-4xl font-bold">AI Agent OS Dashboard</h1>

      <p className="mt-2 text-gray-400">
        CrewAI monitoring console for Devendra&apos;s local agent system.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-gray-400">Backend API</p>
          <h2 className="mt-2 text-2xl font-bold text-green-300">
            {health.api || "unknown"}
          </h2>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-gray-400">Memory DB</p>
          <h2 className="mt-2 text-2xl font-bold">
            {health.memory_db_exists ? "Ready" : "Missing"}
          </h2>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-gray-400">Current Outputs</p>
          <h2 className="mt-2 text-2xl font-bold">{outputs.count}</h2>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-gray-400">Runs Folder</p>
          <h2 className="mt-2 text-2xl font-bold">
            {health.runs_dir_exists ? "Ready" : "Missing"}
          </h2>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-xl font-semibold">Pages</h2>

        <div className="mt-4 flex flex-wrap gap-4">
          <a className="rounded-lg bg-blue-600 px-4 py-2" href="/agents">
            Agent Status
          </a>

          <a className="rounded-lg bg-white/10 px-4 py-2" href="/outputs">
            Outputs
          </a>

          <a className="rounded-lg bg-white/10 px-4 py-2" href="/runs">
            Runs
          </a>

          <a className="rounded-lg bg-white/10 px-4 py-2" href="/settings">
            Settings
          </a>
        </div>
      </div>
      <div className="mt-8">
        <ControlPanel />
      </div>
    </main>
  );
}