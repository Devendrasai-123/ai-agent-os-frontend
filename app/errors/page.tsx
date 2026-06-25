import { getErrors } from "@/lib/api";

export default async function ErrorsPage() {
    const data = await getErrors();

    return (
        <main className="min-h-screen bg-slate-950 p-8 text-white">
            <a href="/" className="text-blue-400">
                Back to Dashboard
            </a>

            <h1 className="mt-6 text-4xl font-bold">Errors</h1>

            <p className="mt-2 text-gray-400">
                Logged CrewAI/backend errors and suggested fixes.
            </p>

            <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-gray-400">Total Errors</p>
                <h2 className="mt-2 text-3xl font-bold">{data.count}</h2>
            </div>

            <div className="mt-8 grid gap-4">
                {data.errors?.length === 0 && (
                    <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-5 text-green-300">
                        No errors found. System looks clean.
                    </div>
                )}

                {data.errors?.map((error: any) => (
                    <div
                        key={error.id}
                        className="rounded-xl border border-red-500/20 bg-red-500/10 p-5"
                    >
                        <h2 className="text-xl font-semibold text-red-300">
                            {error.error_type || "Unknown Error"}
                        </h2>

                        <p className="mt-3 text-sm text-gray-400">Agent</p>
                        <p className="mt-1 text-gray-200">
                            {error.agent_name || "Unknown"}
                        </p>

                        <p className="mt-3 text-sm text-gray-400">Message</p>
                        <p className="mt-1 whitespace-pre-wrap break-all text-gray-200">
                            {error.error_message || "No message"}
                        </p>

                        <p className="mt-3 text-sm text-gray-400">Suggested Fix</p>
                        <p className="mt-1 whitespace-pre-wrap text-gray-200">
                            {error.suggested_fix || "No fix added"}
                        </p>

                        <p className="mt-3 text-sm text-gray-500">
                            {error.created_at || ""}
                        </p>
                    </div>
                ))}
            </div>
        </main>
    );
}