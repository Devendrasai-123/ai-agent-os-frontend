import { getLongTermMemory } from "@/lib/api";

export default async function LongMemoryPage() {
    const data = await getLongTermMemory();

    return (
        <section className="min-h-screen bg-slate-950 p-8 text-white">
            <h1 className="text-4xl font-bold">Long-Term Memory</h1>

            <p className="mt-2 text-gray-400">
                Permanent project rules, known fixes, model settings, and architecture decisions.
            </p>

            <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-gray-400">Memory File</p>
                <h2 className="mt-2 text-xl font-bold">
                    {data.exists ? "Ready" : "Missing"}
                </h2>
            </div>

            <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-5">
                <h2 className="text-xl font-semibold">Content</h2>

                <pre className="mt-4 max-h-[600px] overflow-auto whitespace-pre-wrap rounded-lg bg-black/40 p-4 text-sm text-gray-200">
                    {data.content || "No long-term memory content found."}
                </pre>
            </div>
        </section>
    );
}
