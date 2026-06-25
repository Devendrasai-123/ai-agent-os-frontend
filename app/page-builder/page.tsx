"use client";

import { useState } from "react";
import { generatePageCode } from "@/lib/api";

export default function PageBuilderPage() {
    const [pageName, setPageName] = useState("ai_chat_dashboard");
    const [routePath, setRoutePath] = useState("/chat");
    const [description, setDescription] = useState(
        "Build a modern AI chat dashboard page using my saved UI reference analysis. It should have a left sidebar, recent chats, main chat area, model selector, file upload area, message bubbles, copy button, rethink button, and dark premium styling."
    );
    const [model, setModel] = useState("moonshotai/kimi-k2.6");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [code, setCode] = useState("");
    const [savedFile, setSavedFile] = useState("");

    async function handleGenerate() {
        if (!pageName.trim() || !description.trim()) {
            setMessage("Page name and description are required.");
            return;
        }

        setLoading(true);
        setMessage("");
        setCode("");
        setSavedFile("");

        try {
            const result = await generatePageCode({
                page_name: pageName,
                route_path: routePath,
                description,
                model,
            });

            if (!result.ok) {
                setMessage(result.message || "Page generation failed.");
                return;
            }

            setMessage("Page generated successfully.");
            setCode(result.code || "");
            setSavedFile(result.saved_file || "");
        } catch {
            setMessage("Failed to generate page. Check backend and NVIDIA API.");
        } finally {
            setLoading(false);
        }
    }

    async function copyCode() {
        if (!code) return;
        await navigator.clipboard.writeText(code);
        setMessage("Code copied.");
    }

    return (
        <main className="min-h-screen bg-slate-950 px-6 py-6 text-white">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">Page Builder</h1>
                    <p className="mt-2 text-gray-400">
                        Generate React + Tailwind pages using your saved UI memory and reference analysis.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
                    <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
                        <h2 className="text-xl font-semibold">Generate New Page</h2>

                        <div className="mt-5 space-y-4">
                            <div>
                                <label className="text-sm text-gray-300">Page name</label>
                                <input
                                    value={pageName}
                                    onChange={(e) => setPageName(e.target.value)}
                                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-blue-500"
                                    placeholder="ai_chat_dashboard"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-300">Route path</label>
                                <input
                                    value={routePath}
                                    onChange={(e) => setRoutePath(e.target.value)}
                                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-blue-500"
                                    placeholder="/chat"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-300">Model</label>
                                <select
                                    value={model}
                                    onChange={(e) => setModel(e.target.value)}
                                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-blue-500"
                                >
                                    <option value="moonshotai/kimi-k2.6">
                                        moonshotai/kimi-k2.6
                                    </option>
                                    <option value="z-ai/glm-5.1">z-ai/glm-5.1</option>
                                    <option value="meta/llama-3.1-70b-instruct">
                                        meta/llama-3.1-70b-instruct
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm text-gray-300">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="mt-2 h-56 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-blue-500"
                                    placeholder="Tell AI what page to build..."
                                />
                            </div>

                            <button
                                onClick={handleGenerate}
                                disabled={loading}
                                className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                            >
                                {loading ? "Generating..." : "Generate Page"}
                            </button>

                            {message && (
                                <p className="rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-gray-300">
                                    {message}
                                </p>
                            )}

                            {savedFile && (
                                <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-200">
                                    Saved file:
                                    <br />
                                    <span className="break-all">{savedFile}</span>
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
                        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h2 className="text-xl font-semibold">Generated Code</h2>
                                <p className="mt-1 text-sm text-gray-400">
                                    Code is also saved in generated/pages.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={copyCode}
                                    disabled={!code}
                                    className="rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-200 hover:bg-white/10 disabled:opacity-50"
                                >
                                    Copy Code
                                </button>

                                <a
                                    href="/generated"
                                    className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                                >
                                    Open Generated
                                </a>
                            </div>
                        </div>

                        {code ? (
                            <pre className="max-h-[720px] overflow-auto rounded-2xl border border-white/10 bg-black/50 p-5 text-sm leading-6 text-gray-200">
                                {code}
                            </pre>
                        ) : (
                            <div className="flex min-h-[520px] items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-center text-gray-400">
                                Generated TSX code will appear here.
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
}