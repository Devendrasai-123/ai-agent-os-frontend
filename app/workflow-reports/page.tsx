"use client";

import { useEffect, useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";

type WorkflowReport = {
  file_name: string;
  modified: string;
  size_kb: number;
  preview: string;
};

export default function WorkflowReportsPage() {
  const [reports, setReports] = useState<WorkflowReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<WorkflowReport | null>(null);
  const [message, setMessage] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const [loading, setLoading] = useState(false);

  const loadReports = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(`${API_BASE}/agent-workflow/reports`);
      const data = await response.json();

      if (!data.ok) {
        setMessage(data.message || data.error || "Failed to load reports.");
        setReports([]);
        return;
      }

      setReports(data.items || []);
      setSelectedReport(data.items?.[0] || null);
      setUpdatedAt(data.updated_at || "");
    } catch {
      setMessage("Backend not reachable. Start FastAPI on port 8000.");
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(`${API_BASE}/agent-workflow/report`, {
        method: "POST",
      });

      const data = await response.json();

      if (!data.ok) {
        setMessage(data.message || data.error || "Failed to generate report.");
        return;
      }

      setMessage(`Generated report: ${data.file_name}`);
      await loadReports();
    } catch {
      setMessage("Could not generate report. Check backend terminal.");
    } finally {
      setLoading(false);
    }
  };

  const copyPreview = async () => {
    if (!selectedReport?.preview) return;
    await navigator.clipboard.writeText(selectedReport.preview);
    setMessage("Report preview copied.");
  };

  useEffect(() => {
    loadReports();
  }, []);

  return (
    <div className="min-h-screen bg-[#050816] px-8 pb-8 text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-600/20 via-white/[0.04] to-violet-500/10 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-300">
                Workflow Reports
              </p>
              <h1 className="mt-2 text-3xl font-black">
                Save Agent Workflow as Reports
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-400">
                Generate readable markdown reports from the latest PM → UI/UX → Frontend → Backend → QA workflow.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={loadReports}
                disabled={loading}
                className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15 disabled:opacity-50"
              >
                {loading ? "Loading..." : "Refresh"}
              </button>

              <button
                onClick={generateReport}
                disabled={loading}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold hover:bg-emerald-500 disabled:opacity-50"
              >
                Generate Report
              </button>
            </div>
          </div>
        </section>

        {message && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {message}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm text-slate-400">Reports</p>
            <p className="mt-2 text-3xl font-black text-emerald-300">
              {reports.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm text-slate-400">Selected</p>
            <p className="mt-2 break-words text-xs font-bold text-slate-100">
              {selectedReport?.file_name || "No report selected"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm text-slate-400">Updated</p>
            <p className="mt-2 text-sm font-bold text-slate-100">
              {updatedAt || "Not loaded"}
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-xl font-bold">Saved Reports</h2>

            <div className="mt-5 space-y-3">
              {reports.map((report) => (
                <button
                  key={report.file_name}
                  onClick={() => setSelectedReport(report)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selectedReport?.file_name === report.file_name
                      ? "border-emerald-500/60 bg-emerald-500/10"
                      : "border-white/10 bg-black/20 hover:bg-white/[0.06]"
                  }`}
                >
                  <p className="break-words text-sm font-bold text-slate-100">
                    {report.file_name}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {report.modified} · {report.size_kb} KB
                  </p>
                </button>
              ))}

              {reports.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-slate-400">
                  No workflow reports yet. Click Generate Report.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold">Report Preview</h2>

              <button
                onClick={copyPreview}
                disabled={!selectedReport}
                className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15 disabled:opacity-50"
              >
                Copy Preview
              </button>
            </div>

            <pre className="mt-5 max-h-[75vh] overflow-y-auto whitespace-pre-wrap break-words rounded-2xl border border-white/10 bg-black/40 p-5 font-mono text-xs leading-6 text-slate-300">
              {selectedReport?.preview || "No report selected."2xl border border-white/10 bg-black/40 p-5 font-mono text-xs leading-6 text-slate-300">
              {selectedReport?.preview || "No report selected."}
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
}
