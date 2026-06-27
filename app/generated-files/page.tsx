
"use client";

import { useEffect, useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";

type GeneratedFile = {
  file_name: string;
  path: string;
  size_bytes: number;
  updated_at: string;
  preview: string;
};

type Stats = {
  count: number;
  total_size_bytes: number;
  latest_file: null | {
    file_name: string;
    updated_at: string;
    size_bytes: number;
  };
  folder: string;
};

export default function GeneratedFilesPage() {
  const [files, setFiles] = useState<GeneratedFile[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [selectedContent, setSelectedContent] = useState("");
  const [routePath, setRoutePath] = useState("generated-health-dashboard");
  const [installPlan, setInstallPlan] = useState<any>(null);
  const [message, setMessage] = useState("");

  async function loadData() {
    setMessage("");

    try {
      const [filesRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/agent-file-writer/files`),
        fetch(`${API_BASE}/agent-file-writer/stats`),
      ]);

      const filesData = await filesRes.json();
      const statsData = await statsRes.json();

      if (filesData.ok) setFiles(filesData.files || []);
      if (statsData.ok) setStats(statsData);
    } catch (error) {
      setMessage("Backend not running or routes not available.");
    }
  }

  async function openFile(name: string) {
    setSelectedFileName(name);
    setSelectedContent("");
    setInstallPlan(null);
    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/agent-file-writer/files/${encodeURIComponent(name)}`);
      const data = await res.json();

      if (data.ok) {
        setSelectedContent(data.content || "");
      } else {
        setMessage(data.message || "Failed to open file.");
      }
    } catch (error) {
      setMessage("Backend not running or route not available.");
    }
  }

  async function copyCode() {
    await navigator.clipboard.writeText(selectedContent);
    setMessage("Code copied.");
  }

  async function deleteFile(name: string) {
    const ok = confirm(`Delete generated file: ${name}?`);
    if (!ok) return;

    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/agent-file-writer/files/${encodeURIComponent(name)}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.ok) {
        setMessage(`Deleted: ${name}`);
        if (selectedFileName === name) {
          setSelectedFileName("");
          setSelectedContent("");
          setInstallPlan(null);
        }
        await loadData();
      } else {
        setMessage(data.message || "Delete failed.");
      }
    } catch (error) {
      setMessage("Backend not running or route not available.");
    }
  }

  async function createInstallPlan() {
    if (!selectedFileName) {
      setMessage("Select a file first.");
      return;
    }

    setMessage("");
    setInstallPlan(null);

    try {
      const res = await fetch(`${API_BASE}/agent-file-writer/install-plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          file_name: selectedFileName,
          route_path: routePath,
        }),
      });

      const data = await res.json();

      if (data.ok) {
        setInstallPlan(data);
        setMessage("Install plan created.");
      } else {
        setMessage(data.message || "Failed to create install plan.");
      }
    } catch (error) {
      setMessage("Backend not running or route not available.");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <main style={{ minHeight: "100vh", background: "#050816", color: "white", padding: "32px" }}>
      <section style={{ border: "1px solid #263044", borderRadius: "24px", padding: "24px", marginBottom: "24px" }}>
        <p style={{ color: "#38bdf8", fontWeight: 800, letterSpacing: "2px", fontSize: "12px" }}>
          GENERATED FILE LIBRARY
        </p>

        <h1 style={{ fontSize: "32px", fontWeight: 900, marginTop: "8px" }}>
          Manage Agent-Created Files
        </h1>

        <p style={{ color: "#94a3b8", marginTop: "8px" }}>
          Open, copy, delete, and prepare generated files for Safe Install.
        </p>
      </section>

      {message && (
        <section style={{ border: "1px solid #0e7490", borderRadius: "16px", padding: "16px", marginBottom: "24px", color: "#a5f3fc" }}>
          {message}
        </section>
      )}

      <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        <div style={{ border: "1px solid #263044", borderRadius: "18px", padding: "18px" }}>
          <p style={{ color: "#94a3b8" }}>Files</p>
          <h2 style={{ fontSize: "30px", fontWeight: 900 }}>{stats?.count ?? files.length}</h2>
        </div>

        <div style={{ border: "1px solid #263044", borderRadius: "18px", padding: "18px" }}>
          <p style={{ color: "#94a3b8" }}>Total Size</p>
          <h2 style={{ fontSize: "30px", fontWeight: 900 }}>{stats?.total_size_bytes ?? 0} bytes</h2>
        </div>

        <div style={{ border: "1px solid #263044", borderRadius: "18px", padding: "18px" }}>
          <p style={{ color: "#94a3b8" }}>Latest</p>
          <h2 style={{ fontSize: "16px", fontWeight: 800, marginTop: "8px" }}>
            {stats?.latest_file?.file_name || "No file yet"}
          </h2>
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: "24px" }}>
        <div style={{ border: "1px solid #263044", borderRadius: "20px", padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
            <h2 style={{ fontSize: "22px", fontWeight: 800 }}>Files</h2>
            <button onClick={loadData} style={{ padding: "10px 12px", borderRadius: "10px" }}>
              Refresh
            </button>
          </div>

          <div style={{ display: "grid", gap: "12px", marginTop: "16px" }}>
            {files.length === 0 && <p style={{ color: "#94a3b8" }}>No generated files yet.</p>}

            {files.map((file) => (
              <div
                key={file.file_name}
                style={{
                  padding: "14px",
                  borderRadius: "14px",
                  border: selectedFileName === file.file_name ? "1px solid #38bdf8" : "1px solid #263044",
                  background: "#0b1020",
                }}
              >
                <button
                  onClick={() => openFile(file.file_name)}
                  style={{ background: "transparent", color: "white", border: "none", padding: 0, textAlign: "left", width: "100%" }}
                >
                  <div style={{ fontWeight: 800 }}>{file.file_name}</div>
                  <div style={{ color: "#94a3b8", fontSize: "12px", marginTop: "4px" }}>
                    {file.size_bytes} bytes ? {file.updated_at}
                  </div>
                </button>

                <button
                  onClick={() => deleteFile(file.file_name)}
                  style={{ marginTop: "10px", padding: "8px 10px", borderRadius: "8px", background: "#220b0b", color: "#fca5a5", border: "1px solid #7f1d1d" }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gap: "24px" }}>
          <section style={{ border: "1px solid #263044", borderRadius: "20px", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              <h2 style={{ fontSize: "22px", fontWeight: 800 }}>
                Preview {selectedFileName ? `? ${selectedFileName}` : ""}
              </h2>

              <button onClick={copyCode} disabled={!selectedContent} style={{ padding: "10px 12px", borderRadius: "10px" }}>
                Copy Code
              </button>
            </div>

            <pre
              style={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                background: "#020617",
                border: "1px solid #263044",
                borderRadius: "14px",
                padding: "14px",
                marginTop: "14px",
                color: "#cbd5e1",
                fontSize: "12px",
                lineHeight: "20px",
                minHeight: "260px",
              }}
            >
              {selectedContent || "Select a generated file to preview it."}
            </pre>
          </section>

          <section style={{ border: "1px solid #263044", borderRadius: "20px", padding: "20px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: 800 }}>Install Plan</h2>

            <p style={{ color: "#94a3b8", marginTop: "8px" }}>
              This does not install yet. It only prepares the target route and diff for review.
            </p>

            <label style={{ display: "block", marginTop: "16px", color: "#94a3b8" }}>Target route</label>
            <input
              value={routePath}
              onChange={(e) => setRoutePath(e.target.value)}
              style={{ width: "100%", padding: "12px", marginTop: "6px", borderRadius: "10px", background: "#020617", color: "white", border: "1px solid #263044" }}
            />

            <button onClick={createInstallPlan} disabled={!selectedFileName} style={{ marginTop: "16px", padding: "12px 16px", borderRadius: "10px", fontWeight: 800 }}>
              Create Install Plan
            </button>

            {installPlan && (
              <div style={{ marginTop: "18px" }}>
                <p style={{ color: "#a5f3fc" }}>Target: {installPlan.target_path}</p>
                <p style={{ color: installPlan.target_exists ? "#facc15" : "#86efac", marginTop: "6px" }}>
                  {installPlan.target_exists ? "Target page already exists." : "New target page will be created."}
                </p>

                <pre
                  style={{
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    background: "#020617",
                    border: "1px solid #263044",
                    borderRadius: "14px",
                    padding: "14px",
                    marginTop: "14px",
                    color: "#cbd5e1",
                    fontSize: "12px",
                    lineHeight: "20px",
                    maxHeight: "360px",
                    overflow: "auto",
                  }}
                >
                  {(installPlan.diff || []).join("\n") || "No diff. New file or same content."}
                </pre>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
