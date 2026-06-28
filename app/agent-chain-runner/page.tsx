
"use client";

import { useEffect, useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";

export default function AgentChainRunnerPage() {
  const [featureName, setFeatureName] = useState("One Click Feature Builder");
  const [task, setTask] = useState("Build a safe generated dashboard feature from one click.");
  const [priority, setPriority] = useState("High");
  const [style, setStyle] = useState("Dark AI dashboard");
  const [frontendRoute, setFrontendRoute] = useState("one-click-feature");
  const [backendRoute, setBackendRoute] = useState("one-click-feature-api");
  const [runQa, setRunQa] = useState(true);
  const [history, setHistory] = useState<any[]>([]);
  const [selectedRun, setSelectedRun] = useState<any>(null);
  const [latestFrontendFile, setLatestFrontendFile] = useState("");
  const [installPreview, setInstallPreview] = useState<any>(null);
  const [approvalText, setApprovalText] = useState("");
  const [message, setMessage] = useState("");
  const [running, setRunning] = useState(false);

  async function loadHistory() {
    try {
      const res = await fetch(`${API_BASE}/agent-chain-runner/history`);
      const data = await res.json();

      if (data.ok) {
        setHistory(data.history || []);
      } else {
        setMessage(data.message || "Failed to load chain history.");
      }
    } catch (error) {
      setMessage("Backend not running or chain history route not available.");
    }
  }

  async function runChain() {
    setRunning(true);
    setMessage("");
    setSelectedRun(null);

    try {
      const res = await fetch(`${API_BASE}/agent-chain-runner/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feature_name: featureName,
          task,
          priority,
          style,
          frontend_route: frontendRoute,
          backend_route: backendRoute,
          run_qa: runQa,
        }),
      });

      const data = await res.json();

      if (data.ok) {
        setMessage(data.approved ? "Agent chain completed and approved." : "Agent chain completed but not approved.");
        setSelectedRun(data.run);
        setLatestFrontendFile(findFrontendFile(data.run));
        await loadHistory();
      } else {
        setMessage(data.message || "Agent chain failed.");
      }
    } catch (error) {
      setMessage("Backend not running or chain runner route not available.");
    } finally {
      setRunning(false);
    }
  }


  function findFrontendFile(run: any) {
    if (!run || !run.steps) return "";
    const found = run.steps.find((step: any) => String(step.file || "").endsWith(".tsx"));
    return found?.file || "";
  }

  async function loadLatestRun() {
    try {
      const res = await fetch(`${API_BASE}/agent-chain-runner/latest`);
      const data = await res.json();

      if (data.ok) {
        setLatestFrontendFile(data.frontend_file || "");
        if (data.latest_run) {
          setSelectedRun(data.latest_run);
        }
      }
    } catch (error) {
      // keep quiet because history still works
    }
  }

  async function previewSafeInstall() {
    setMessage("");
    setInstallPreview(null);

    const fileName = latestFrontendFile || findFrontendFile(selectedRun);

    if (!fileName) {
      setMessage("No generated frontend .tsx file found from latest chain run.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/agent-chain-runner/safe-install-preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_name: fileName,
          target_route: frontendRoute,
        }),
      });

      const data = await res.json();

      if (data.ok) {
        setInstallPreview(data);
        setMessage("Safe install preview created.");
      } else {
        setMessage(data.message || "Safe install preview failed.");
      }
    } catch (error) {
      setMessage("Backend not running or safe install preview route not available.");
    }
  }

  async function approveSafeInstall() {
    setMessage("");

    if (!installPreview) {
      setMessage("Create preview first.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/agent-chain-runner/safe-install-approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_name: installPreview.source_file,
          target_route: installPreview.target_route,
          approval_text: approvalText,
        }),
      });

      const data = await res.json();

      if (data.ok) {
        setMessage("Chain generated page installed safely.");
        setApprovalText("");
      } else {
        setMessage(data.message || "Safe install approval failed.");
      }
    } catch (error) {
      setMessage("Backend not running or safe install approval route not available.");
    }
  }

  useEffect(() => {
    loadHistory();
    loadLatestRun();
  }, []);

  return (
    <main style={{ minHeight: "100vh", background: "#050816", color: "white", padding: "32px" }}>
      <section style={{ border: "1px solid #263044", borderRadius: "24px", padding: "24px", marginBottom: "24px" }}>
        <p style={{ color: "#38bdf8", fontWeight: 800, letterSpacing: "2px", fontSize: "12px" }}>
          AGENT CHAIN RUNNER V1
        </p>

        <h1 style={{ fontSize: "32px", fontWeight: 900, marginTop: "8px" }}>
          One Click AI Software Factory
        </h1>

        <p style={{ color: "#94a3b8", marginTop: "8px" }}>
          Run PM, UI/UX, Frontend, Backend, QA, and Reviewer agents in one flow.
        </p>
      </section>

      {message && (
        <section style={{ border: "1px solid #0e7490", borderRadius: "16px", padding: "16px", marginBottom: "24px", color: "#a5f3fc" }}>
          {message}
        </section>
      )}

      <section style={{ display: "grid", gridTemplateColumns: "420px 1fr", gap: "24px" }}>
        <div style={{ display: "grid", gap: "24px", alignContent: "start" }}>
          <section style={{ border: "1px solid #263044", borderRadius: "20px", padding: "20px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: 800 }}>Run Full Chain</h2>

            <label style={labelStyle}>Feature name</label>
            <input value={featureName} onChange={(e) => setFeatureName(e.target.value)} style={inputStyle} />

            <label style={labelStyle}>Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} style={inputStyle}>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>

            <label style={labelStyle}>UI style</label>
            <input value={style} onChange={(e) => setStyle(e.target.value)} style={inputStyle} />

            <label style={labelStyle}>Frontend route</label>
            <input value={frontendRoute} onChange={(e) => setFrontendRoute(e.target.value)} style={inputStyle} />

            <label style={labelStyle}>Backend route</label>
            <input value={backendRoute} onChange={(e) => setBackendRoute(e.target.value)} style={inputStyle} />

            <label style={labelStyle}>Task</label>
            <textarea value={task} onChange={(e) => setTask(e.target.value)} rows={6} style={inputStyle} />

            <label style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "16px", color: "#cbd5e1" }}>
              <input type="checkbox" checked={runQa} onChange={(e) => setRunQa(e.target.checked)} />
              Run QA checks
            </label>

            <button
              onClick={runChain}
              disabled={running}
              style={{ marginTop: "18px", padding: "14px 18px", borderRadius: "12px", fontWeight: 900, background: "#1e3a8a", color: "white", border: "1px solid #60a5fa", width: "100%" }}
            >
              {running ? "Running Full Chain..." : "Run Full Agent Chain"}
            </button>
          </section>


          <section style={{ border: "1px solid #263044", borderRadius: "20px", padding: "20px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: 800 }}>Safe Install Latest Frontend Draft</h2>

            <p style={{ color: "#94a3b8", marginTop: "8px" }}>
              Generated file: {latestFrontendFile || findFrontendFile(selectedRun) || "No generated .tsx file yet"}
            </p>

            <p style={{ color: "#94a3b8", marginTop: "8px" }}>
              Target route: /{frontendRoute}
            </p>

            <button
              onClick={previewSafeInstall}
              style={{ marginTop: "14px", padding: "12px 14px", borderRadius: "10px", fontWeight: 900, background: "#1e3a8a", color: "white", border: "1px solid #60a5fa", width: "100%" }}
            >
              Preview Safe Install
            </button>

            {installPreview && (
              <div style={{ marginTop: "16px", border: "1px solid #263044", borderRadius: "14px", padding: "14px", background: "#020617" }}>
                <p style={{ color: "#86efac", fontWeight: 900 }}>Preview Ready</p>
                <p style={{ color: "#94a3b8", fontSize: "12px", marginTop: "6px" }}>
                  Target: {installPreview.target_path}
                </p>
                <p style={{ color: "#94a3b8", fontSize: "12px", marginTop: "6px" }}>
                  Old lines: {installPreview.preview?.old_line_count} ? New lines: {installPreview.preview?.new_line_count}
                </p>

                <label style={{ display: "block", marginTop: "12px", color: "#94a3b8" }}>
                  Type APPROVE CHAIN INSTALL
                </label>

                <input
                  value={approvalText}
                  onChange={(e) => setApprovalText(e.target.value)}
                  style={inputStyle}
                />

                <button
                  onClick={approveSafeInstall}
                  style={{ marginTop: "12px", padding: "12px 14px", borderRadius: "10px", fontWeight: 900, background: "#14532d", color: "white", border: "1px solid #86efac", width: "100%" }}
                >
                  Approve Install
                </button>
              </div>
            )}
          </section>

          <section style={{ border: "1px solid #263044", borderRadius: "20px", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
              <h2 style={{ fontSize: "22px", fontWeight: 800 }}>History</h2>
              <button onClick={loadHistory} style={{ padding: "10px 12px", borderRadius: "10px" }}>
                Refresh
              </button>
            </div>

            <div style={{ display: "grid", gap: "12px", marginTop: "16px" }}>
              {history.length === 0 && <p style={{ color: "#94a3b8" }}>No chain runs yet.</p>}

              {history.map((item, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedRun(item)}
                  style={{ textAlign: "left", padding: "14px", borderRadius: "14px", border: "1px solid #263044", background: "#0b1020", color: "white" }}
                >
                  <div style={{ fontWeight: 900 }}>{item.feature_name}</div>
                  <div style={{ color: item.status === "approved" ? "#86efac" : "#fca5a5", fontSize: "12px", marginTop: "4px" }}>
                    {item.status} ? {item.created_at}
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>

        <section style={{ border: "1px solid #263044", borderRadius: "20px", padding: "20px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 800 }}>Run Details</h2>

          {!selectedRun && (
            <p style={{ color: "#94a3b8", marginTop: "14px" }}>
              Run the chain or select a previous run.
            </p>
          )}

          {selectedRun && (
            <div style={{ marginTop: "16px" }}>
              <div style={{ border: "1px solid #263044", borderRadius: "16px", padding: "16px", background: "#0b1020" }}>
                <h3 style={{ fontSize: "22px", fontWeight: 900 }}>{selectedRun.feature_name}</h3>
                <p style={{ color: "#94a3b8", marginTop: "8px" }}>{selectedRun.task}</p>
                <p style={{ marginTop: "10px", color: selectedRun.status === "approved" ? "#86efac" : "#fca5a5", fontWeight: 900 }}>
                  {selectedRun.status?.toUpperCase()}
                </p>
              </div>

              <h3 style={{ fontSize: "18px", fontWeight: 900, marginTop: "22px" }}>Steps</h3>

              <div style={{ display: "grid", gap: "12px", marginTop: "12px" }}>
                {(selectedRun.steps || []).map((step: any, index: number) => (
                  <div key={index} style={{ border: "1px solid #263044", borderRadius: "14px", padding: "14px", background: "#020617" }}>
                    <div style={{ fontWeight: 900 }}>{step.agent}</div>
                    <div style={{ color: "#94a3b8", fontSize: "12px", marginTop: "4px" }}>
                      Status: {step.status}
                    </div>
                    <div style={{ color: "#64748b", fontSize: "12px", marginTop: "4px" }}>
                      File: {step.file}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginTop: "6px",
  borderRadius: "10px",
  background: "#020617",
  color: "white",
  border: "1px solid #263044",
} as React.CSSProperties;

const labelStyle = {
  display: "block",
  marginTop: "16px",
  color: "#94a3b8",
} as React.CSSProperties;
