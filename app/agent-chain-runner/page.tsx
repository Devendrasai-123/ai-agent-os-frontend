
"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

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
  const [installQaResult, setInstallQaResult] = useState<any>(null);
  const [installQaRunning, setInstallQaRunning] = useState(false);
  const [rollbackText, setRollbackText] = useState("");
  const [rollbackResult, setRollbackResult] = useState<any>(null);
  const [rollbackRunning, setRollbackRunning] = useState(false);

  const [message, setMessage] = useState("");
  const [running, setRunning] = useState(false);

  function findFrontendFile(run: any) {
    if (!run || !run.steps) return "";
    const found = run.steps.find((step: any) =>
      String(step.file || "").endsWith(".tsx")
    );
    return found?.file || "";
  }

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
      // Safe install bridge may not exist yet. Keep page usable.
    }
  }

  async function runChain() {
    setRunning(true);
    setMessage("");
    setSelectedRun(null);
    setInstallPreview(null);
    setInstallQaResult(null);

    try {
      const res = await fetch(`${API_BASE}/agent-chain-runner/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          feature_name: featureName,
          task,
          priority,
          style,
          frontend_route: frontendRoute,
          backend_route: backendRoute,
          run_qa: runQa
        })
      });

      const data = await res.json();

      if (data.ok) {
        const generatedFile = findFrontendFile(data.run);
        setMessage(
          data.approved
            ? "Agent chain completed and approved."
            : "Agent chain completed but not approved."
        );
        setSelectedRun(data.run);
        setLatestFrontendFile(generatedFile);
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

  async function previewSafeInstall() {
    setMessage("");
    setInstallPreview(null);
    setInstallQaResult(null);

    const fileName = latestFrontendFile || findFrontendFile(selectedRun);

    if (!fileName) {
      setMessage("No generated frontend .tsx file found from latest chain run.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/agent-chain-runner/safe-install-preview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          file_name: fileName,
          target_route: frontendRoute
        })
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
    setInstallQaResult(null);

    if (!installPreview) {
      setMessage("Create preview first.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/agent-chain-runner/safe-install-approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          file_name: installPreview.source_file,
          target_route: installPreview.target_route,
          approval_text: approvalText
        })
      });

      const data = await res.json();

      if (data.ok) {
        setMessage("Chain generated page installed safely. Now run QA after install.");
        setApprovalText("");
      } else {
        setMessage(data.message || "Safe install approval failed.");
      }
    } catch (error) {
      setMessage("Backend not running or safe install approval route not available.");
    }
  }

  async function runQaAfterInstall() {
    setInstallQaRunning(true);
    setMessage("");
    setInstallQaResult(null);

    try {
      const res = await fetch(`${API_BASE}/agent-chain-runner/qa-after-install`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          target_route: frontendRoute,
          note: "QA after Agent Chain safe install"
        })
      });

      const data = await res.json();

      if (data.ok) {
        setInstallQaResult(data.result);
        setMessage(data.message || "QA after install finished.");
      } else {
        setMessage(data.message || "QA after install failed.");
      }
    } catch (error) {
      setMessage("Backend not running or QA after install route not available.");
    } finally {
      setInstallQaRunning(false);
    }
  }


  async function rollbackLastInstall() {
    setRollbackRunning(true);
    setMessage("");
    setRollbackResult(null);

    try {
      const res = await fetch(`${API_BASE}/agent-chain-runner/rollback-last-install`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          target_route: frontendRoute,
          approval_text: rollbackText,
          reason: "Rollback from Agent Chain Runner UI"
        })
      });

      const data = await res.json();

      if (data.ok) {
        setRollbackResult(data.rollback);
        setMessage(data.message || "Rollback completed.");
        setRollbackText("");
      } else {
        setMessage(data.message || "Rollback failed.");
      }
    } catch (error) {
      setMessage("Backend not running or rollback route not available.");
    } finally {
      setRollbackRunning(false);
    }
  }

  useEffect(() => {
    loadHistory();
    loadLatestRun();
  }, []);

  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <p style={eyebrowStyle}>AGENT CHAIN RUNNER V1</p>

        <h1 style={titleStyle}>One Click AI Software Factory</h1>

        <p style={mutedTextStyle}>
          Run PM, UI/UX, Frontend, Backend, QA, Reviewer, safe install, and post-install QA from one page.
        </p>
      </section>

      {message && (
        <section style={messageStyle}>
          {message}
        </section>
      )}

      <section style={gridStyle}>
        <div style={leftColumnStyle}>
          <section style={cardStyle}>
            <h2 style={sectionTitleStyle}>Run Full Chain</h2>

            <label style={labelStyle}>Feature name</label>
            <input
              value={featureName}
              onChange={(event) => setFeatureName(event.target.value)}
              style={inputStyle}
            />

            <label style={labelStyle}>Priority</label>
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              style={inputStyle}
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>

            <label style={labelStyle}>UI style</label>
            <input
              value={style}
              onChange={(event) => setStyle(event.target.value)}
              style={inputStyle}
            />

            <label style={labelStyle}>Frontend route</label>
            <input
              value={frontendRoute}
              onChange={(event) => setFrontendRoute(event.target.value)}
              style={inputStyle}
            />

            <label style={labelStyle}>Backend route</label>
            <input
              value={backendRoute}
              onChange={(event) => setBackendRoute(event.target.value)}
              style={inputStyle}
            />

            <label style={labelStyle}>Task</label>
            <textarea
              value={task}
              onChange={(event) => setTask(event.target.value)}
              rows={6}
              style={inputStyle}
            />

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={runQa}
                onChange={(event) => setRunQa(event.target.checked)}
              />
              Run QA checks during chain
            </label>

            <button
              onClick={runChain}
              disabled={running}
              style={primaryButtonStyle}
            >
              {running ? "Running Full Chain..." : "Run Full Agent Chain"}
            </button>
          </section>

          <section style={cardStyle}>
            <h2 style={sectionTitleStyle}>Safe Install Latest Frontend Draft</h2>

            <p style={mutedTextStyle}>
              Generated file: {latestFrontendFile || findFrontendFile(selectedRun) || "No generated .tsx file yet"}
            </p>

            <p style={mutedTextStyle}>
              Target route: /{frontendRoute}
            </p>

            <button
              onClick={previewSafeInstall}
              style={primaryButtonStyle}
            >
              Preview Safe Install
            </button>

            {installPreview && (
              <div style={innerPanelStyle}>
                <p style={successTextStyle}>Preview Ready</p>

                <p style={smallMutedStyle}>
                  Target: {installPreview.target_path}
                </p>

                <p style={smallMutedStyle}>
                  Old lines: {installPreview.preview?.old_line_count} ? New lines: {installPreview.preview?.new_line_count}
                </p>

                <label style={labelStyle}>Type APPROVE CHAIN INSTALL</label>

                <input
                  value={approvalText}
                  onChange={(event) => setApprovalText(event.target.value)}
                  style={inputStyle}
                />

                <button
                  onClick={approveSafeInstall}
                  style={approveButtonStyle}
                >
                  Approve Install
                </button>

                <button
                  onClick={runQaAfterInstall}
                  disabled={installQaRunning}
                  style={qaButtonStyle}
                >
                  {installQaRunning ? "Running QA..." : "Run QA After Install"}
                </button>

                {installQaResult && (
                  <div style={qaResultStyle}>
                    <p style={{
                      color: installQaResult.passed ? "#86efac" : "#fca5a5",
                      fontWeight: 900
                    }}>
                      QA Status: {installQaResult.status?.toUpperCase()}
                    </p>

                    <p style={smallMutedStyle}>
                      Backend: {installQaResult.backend?.ok ? "passed" : "failed"} ? Frontend: {installQaResult.frontend?.ok ? "passed" : "failed"}
                    </p>

                    {!installQaResult.passed && (
                      <pre style={errorPreStyle}>
                        {installQaResult.backend?.stderr || installQaResult.frontend?.stderr || "No error details."}
                      </pre>
                    )}
                  </div>
                )}


                <div style={rollbackPanelStyle}>
                  <p style={dangerTextStyle}>Rollback Last Chain Install</p>

                  <p style={smallMutedStyle}>
                    Use this if QA fails after install. It restores the previous backup for /{frontendRoute}.
                  </p>

                  <label style={labelStyle}>Type ROLLBACK CHAIN INSTALL</label>

                  <input
                    value={rollbackText}
                    onChange={(event) => setRollbackText(event.target.value)}
                    style={inputStyle}
                  />

                  <button
                    onClick={rollbackLastInstall}
                    disabled={rollbackRunning}
                    style={rollbackButtonStyle}
                  >
                    {rollbackRunning ? "Rolling Back..." : "Rollback Last Chain Install"}
                  </button>

                  {rollbackResult && (
                    <div style={qaResultStyle}>
                      <p style={successTextStyle}>Rollback completed</p>
                      <p style={smallMutedStyle}>Restored: {rollbackResult.target_path}</p>
                      <p style={smallMutedStyle}>Backup: {rollbackResult.backup_path}</p>
                    </div>
                  )}
                </div>

              </div>
            )}
          </section>

          <section style={cardStyle}>
            <div style={historyHeaderStyle}>
              <h2 style={sectionTitleStyle}>History</h2>

              <button
                onClick={loadHistory}
                style={smallButtonStyle}
              >
                Refresh
              </button>
            </div>

            <div style={historyListStyle}>
              {history.length === 0 && (
                <p style={mutedTextStyle}>No chain runs yet.</p>
              )}

              {history.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedRun(item);
                    setLatestFrontendFile(findFrontendFile(item));
                  }}
                  style={historyItemStyle}
                >
                  <div style={{ fontWeight: 900 }}>{item.feature_name}</div>

                  <div style={{
                    color: item.status === "approved" ? "#86efac" : "#fca5a5",
                    fontSize: "12px",
                    marginTop: "4px"
                  }}>
                    {item.status} ? {item.created_at}
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>

        <section style={cardStyle}>
          <h2 style={sectionTitleStyle}>Run Details</h2>

          {!selectedRun && (
            <p style={mutedTextStyle}>
              Run the chain or select a previous run.
            </p>
          )}

          {selectedRun && (
            <div style={{ marginTop: "16px" }}>
              <div style={innerPanelStyle}>
                <h3 style={detailTitleStyle}>{selectedRun.feature_name}</h3>

                <p style={mutedTextStyle}>{selectedRun.task}</p>

                <p style={{
                  marginTop: "10px",
                  color: selectedRun.status === "approved" ? "#86efac" : "#fca5a5",
                  fontWeight: 900
                }}>
                  {selectedRun.status?.toUpperCase()}
                </p>
              </div>

              <h3 style={subTitleStyle}>Steps</h3>

              <div style={stepsListStyle}>
                {(selectedRun.steps || []).map((step: any, index: number) => (
                  <div key={index} style={stepCardStyle}>
                    <div style={{ fontWeight: 900 }}>{step.agent}</div>

                    <div style={smallMutedStyle}>
                      Status: {step.status}
                    </div>

                    <div style={smallMutedStyle}>
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

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#050816",
  color: "white",
  padding: "32px"
};

const heroStyle: CSSProperties = {
  border: "1px solid #263044",
  borderRadius: "24px",
  padding: "24px",
  marginBottom: "24px"
};

const eyebrowStyle: CSSProperties = {
  color: "#38bdf8",
  fontWeight: 800,
  letterSpacing: "2px",
  fontSize: "12px"
};

const titleStyle: CSSProperties = {
  fontSize: "32px",
  fontWeight: 900,
  marginTop: "8px"
};

const mutedTextStyle: CSSProperties = {
  color: "#94a3b8",
  marginTop: "8px"
};

const messageStyle: CSSProperties = {
  border: "1px solid #0e7490",
  borderRadius: "16px",
  padding: "16px",
  marginBottom: "24px",
  color: "#a5f3fc"
};

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "420px 1fr",
  gap: "24px"
};

const leftColumnStyle: CSSProperties = {
  display: "grid",
  gap: "24px",
  alignContent: "start"
};

const cardStyle: CSSProperties = {
  border: "1px solid #263044",
  borderRadius: "20px",
  padding: "20px"
};

const sectionTitleStyle: CSSProperties = {
  fontSize: "22px",
  fontWeight: 800
};

const labelStyle: CSSProperties = {
  display: "block",
  marginTop: "16px",
  color: "#94a3b8"
};

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "12px",
  marginTop: "6px",
  borderRadius: "10px",
  background: "#020617",
  color: "white",
  border: "1px solid #263044"
};

const checkboxLabelStyle: CSSProperties = {
  display: "flex",
  gap: "10px",
  alignItems: "center",
  marginTop: "16px",
  color: "#cbd5e1"
};

const primaryButtonStyle: CSSProperties = {
  marginTop: "18px",
  padding: "14px 18px",
  borderRadius: "12px",
  fontWeight: 900,
  background: "#1e3a8a",
  color: "white",
  border: "1px solid #60a5fa",
  width: "100%"
};

const approveButtonStyle: CSSProperties = {
  marginTop: "12px",
  padding: "12px 14px",
  borderRadius: "10px",
  fontWeight: 900,
  background: "#14532d",
  color: "white",
  border: "1px solid #86efac",
  width: "100%"
};

const qaButtonStyle: CSSProperties = {
  marginTop: "12px",
  padding: "12px 14px",
  borderRadius: "10px",
  fontWeight: 900,
  background: "#581c87",
  color: "white",
  border: "1px solid #c084fc",
  width: "100%"
};

const innerPanelStyle: CSSProperties = {
  marginTop: "16px",
  border: "1px solid #263044",
  borderRadius: "14px",
  padding: "14px",
  background: "#020617"
};

const successTextStyle: CSSProperties = {
  color: "#86efac",
  fontWeight: 900
};

const smallMutedStyle: CSSProperties = {
  color: "#94a3b8",
  fontSize: "12px",
  marginTop: "6px"
};

const qaResultStyle: CSSProperties = {
  marginTop: "12px",
  border: "1px solid #263044",
  borderRadius: "12px",
  padding: "12px",
  background: "#0b1020"
};

const errorPreStyle: CSSProperties = {
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  marginTop: "10px",
  color: "#fca5a5",
  fontSize: "11px",
  maxHeight: "180px",
  overflow: "auto"
};

const historyHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  alignItems: "center"
};

const smallButtonStyle: CSSProperties = {
  padding: "10px 12px",
  borderRadius: "10px"
};

const historyListStyle: CSSProperties = {
  display: "grid",
  gap: "12px",
  marginTop: "16px"
};

const historyItemStyle: CSSProperties = {
  textAlign: "left",
  padding: "14px",
  borderRadius: "14px",
  border: "1px solid #263044",
  background: "#0b1020",
  color: "white"
};

const detailTitleStyle: CSSProperties = {
  fontSize: "22px",
  fontWeight: 900
};

const subTitleStyle: CSSProperties = {
  fontSize: "18px",
  fontWeight: 900,
  marginTop: "22px"
};

const stepsListStyle: CSSProperties = {
  display: "grid",
  gap: "12px",
  marginTop: "12px"
};

const stepCardStyle: CSSProperties = {
  border: "1px solid #263044",
  borderRadius: "14px",
  padding: "14px",
  background: "#020617"
};


const rollbackPanelStyle: CSSProperties = {
  marginTop: "14px",
  border: "1px solid #7f1d1d",
  borderRadius: "14px",
  padding: "14px",
  background: "#12060a"
};

const dangerTextStyle: CSSProperties = {
  color: "#fca5a5",
  fontWeight: 900
};

const rollbackButtonStyle: CSSProperties = {
  marginTop: "12px",
  padding: "12px 14px",
  borderRadius: "10px",
  fontWeight: 900,
  background: "#7f1d1d",
  color: "white",
  border: "1px solid #fca5a5",
  width: "100%"
};

