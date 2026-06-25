const links = [
    { name: "Agent Workspace", href: "/agent-workspace-safe-test" },
    { name: "Chat", href: "/chat" },
    { name: "Live Agents", href: "/live-agents" },
    { name: "UI References", href: "/ui-references" },
    { name: "Page Builder", href: "/page-builder" },
    { name: "Generated Outputs", href: "/generated" },
    { name: "Conversation", href: "/conversation" },
    { name: "Dashboard", href: "/" },
    { name: "Agents", href: "/agents" },
    { name: "Outputs", href: "/outputs" },
    { name: "Runs", href: "/runs" },
    { name: "Errors", href: "/errors" },
    { name: "Short Memory", href: "/short-memory" },
    { name: "Long Memory", href: "/long-memory" },
    { name: "Settings", href: "/settings" },
];

export default function Sidebar() {
    return (
        <aside className="fixed left-0 top-0 h-screen w-64 border-r border-white/10 bg-slate-950 p-5 text-white">
            <h1 className="text-xl font-bold">AI Agent OS</h1>

            <p className="mt-1 text-xs text-gray-500">
                CrewAI Control Panel
            </p>

            <nav className="mt-8 flex flex-col gap-2">
                {links.map((link) => (
                    <a
                        key={link.href}
                        href={link.href}
                        className="rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white"
                    >
                        {link.name}
                    </a>
                ))}
            </nav>

            <div className="absolute bottom-5 left-5 right-5 rounded-lg border border-green-500/20 bg-green-500/10 p-3">
                <p className="text-xs text-green-300">Backend</p>
                <p className="text-sm font-semibold text-green-200">Connected</p>
            </div>
        </aside>
    );
}