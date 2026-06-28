
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
  const [registrySyncResult, setRegistrySyncResult] = useState<any>(null);
  const [registrySyncRunning, setRegistrySyncRunning] = useState(false);
  const [projectBrainSyncResult, setProjectBrainSyncResult] = useState<any>(null);
  const [projectBrainSyncRunning, setProjectBrainSyncRunning] = useState(false);
  const [handoffResult, setHandoffResult] = useState<any>(null);
  const [handoffRunning, setHandoffRunning] = useState(false);
  const [completeFlowApproval, setCompleteFlowApproval] = useState("");
  const [completeFlowRunning, setCompleteFlowRunning] = useState(false);
  const [completeFlowResult, setCompleteFlowResult] = useState<any>(null);
  const [safeFlowApproval, setSafeFlowApproval] = useState("");
  const [safeFlowRunning, setSafeFlowRunning] = useState(false);
  const [safeFlowResult, setSafeFlowResult] = useState<any>(null);
  const [liveTimeline, setLiveTimeline] = useState<any[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [timelineGeneratedAt, setTimelineGeneratedAt] = useState("");

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








  async function loadLiveTimeline() {
    setTimelineLoading(true);

    try {
      const res = await fetch(`${API_BASE}/agent-chain-runner/live-timeline`);
      const data = await res.json();

      if (data.ok) {
        setLiveTimeline(data.events || []);
        setTimelineGeneratedAt(data.generated_at || "");
      }
    } catch (error) {
      // Keep quiet. Main page should still work.
    } finally {
      setTimelineLoading(false);
    }
  }

  async function runSafeCompleteFlow() {
    setSafeFlowRunning(true);
    setMessage("");
    setSafeFlowResult(null);

    try {
      const res = await fetch(`${API_BASE}/agent-chain-runner/complete-flow-safe`, {
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
          approval_text: safeFlowApproval,
          run_chain_qa: false,
          auto_rollback_on_qa_fail: true,
          note: "Started from Agent Chain Runner UI"
        })
      });

      const data = await res.json();

      if (data.ok) {
        setSafeFlowResult(data.flow);
        setSelectedRun(data.flow);
        setLatestFrontendFile(data.flow?.generated_frontend_file || "");
        setMessage(data.message || "Safe complete flow finished.");
        await loadHistory();
      } else {
        setSafeFlowResult(data.flow || data);
        setMessage(data.message || "Safe complete flow failed.");
      }
    } catch (error) {
      setMessage("Backend not running or safe complete flow route not available.");
    } finally {
      setSafeFlowRunning(false);
    }
  }

  async function runOneClickCompleteFlow() {
    setCompleteFlowRunning(true);
    setMessage("");
    setCompleteFlowResult(null);

    try {
      const res = await fetch(`${API_BASE}/agent-chain-runner/complete-flow`, {
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
          approval_text: completeFlowApproval,
          run_chain_qa: false,
          note: "Started from Agent Chain Runner UI"
        })
      });

      const data = await res.json();

      if (data.ok) {
        setCompleteFlowResult(data.flow);
        setSelectedRun(data.flow);
        setLatestFrontendFile(data.flow?.generated_frontend_file || "");
        setMessage(data.message || "One click complete flow finished.");
        await loadHistory();
      } else {
        setCompleteFlowResult(data.flow || data);
        setMessage(data.message || "One click complete flow failed.");
      }
    } catch (error) {
      setMessage("Backend not running or complete flow route not available.");
    } finally {
      setCompleteFlowRunning(false);
    }
  }

  async function exportNewChatHandoff() {
    setHandoffRunning(true);
    setMessage("");
    setHandoffResult(null);

    try {
      const res = await fetch(`${API_BASE}/agent-chain-runner/export-handoff`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          feature_name: featureName,
          target_route: frontendRoute,
          backend_route: backendRoute,
          next_task: "Continue building the next AI Agent OS feature step by step.",
          note: "Exported from Agent Chain Runner UI"
        })
      });

      const data = await res.json();

      if (data.ok) {
        setHandoffResult(data);
        setMessage(data.message || "New chat handoff exported.");
      } else {
        setMessage(data.message || "Handoff export failed.");
      }
    } catch (error) {
      setMessage("Backend not running or handoff export route not available.");
    } finally {
      setHandoffRunning(false);
    }
  }

  async function copyHandoffToClipboard() {
    if (!handoffResult?.handoff) {
      setMessage("No handoff text to copy yet.");
      return;
    }

    try {
      await navigator.clipboard.writeText(handoffResult.handoff);
      setMessage("Handoff copied. Paste it into a new chat.");
    } catch (error) {
      setMessage("Could not copy automatically. Select and copy the handoff text manually.");
    }
  }

  async function syncProjectBrain() {
    setProjectBrainSyncRunning(true);
    setMessage("");
    setProjectBrainSyncResult(null);

    try {
      const res = await fetch(`${API_BASE}/agent-chain-runner/sync-project-brain`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          feature_name: featureName,
          target_route: frontendRoute,
          backend_route: backendRoute,
          priority,
          note: "Updated from Agent Chain Runner UI"
        })
      });

      const data = await res.json();

      if (data.ok) {
        setProjectBrainSyncResult(data.sync);
        setMessage(data.message || "Project Brain updated.");
      } else {
        setMessage(data.message || "Project Brain sync failed.");
      }
    } catch (error) {
      setMessage("Backend not running or Project Brain sync route not available.");
    } finally {
      setProjectBrainSyncRunning(false);
    }
  }

  async function syncFeatureRegistry() {
    setRegistrySyncRunning(true);
    setMessage("");
    setRegistrySyncResult(null);

    try {
      const res = await fetch(`${API_BASE}/agent-chain-runner/sync-feature-registry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          feature_name: featureName,
          target_route: frontendRoute,
          backend_route: backendRoute,
          priority,
          status: selectedRun?.status || "built",
          note: "Updated from Agent Chain Runner UI"
        })
      });

      const data = await res.json();

      if (data.ok) {
        setRegistrySyncResult(data.feature);
        setMessage(data.message || "Feature Registry updated.");
      } else {
        setMessage(data.message || "Feature Registry sync failed.");
      }
    } catch (error) {
      setMessage("Backend not running or Feature Registry sync route not available.");
    } finally {
      setRegistrySyncRunning(false);
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
    loadLiveTimeline();

    const timer = window.setInterval(() => {
      loadLiveTimeline();
    }, 5000);

    return () => window.clearInterval(timer);
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


      <section style={timelinePanelStyle}>
        <div style={timelineHeaderStyle}>
          <div>
            <p style={eyebrowStyle}>LIVE PROGRESS</p>
            <h2 style={sectionTitleStyle}>Agent Chain Timeline</h2>
            <p style={smallMutedStyle}>
              Auto-refreshes every 5 seconds. Last refresh: {timelineGeneratedAt || "not loaded"}
            </p>
          </div>

          <button
            onClick={loadLiveTimeline}
            style={smallButtonStyle}
          >
            {timelineLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div style={timelineListStyle}>
          {liveTimeline.length === 0 && (
            <p style={mutedTextStyle}>No timeline events yet. Run a chain flow first.</p>
          )}

          {liveTimeline.slice(0, 12).map((event, index) => (
            <div key={index} style={timelineItemStyle}>
              <div style={timelineDotStyle} />

              <div style={{ flex: 1 }}>
                <div style={timelineTitleRowStyle}>
                  <strong>{event.title}</strong>
                  <span style={timelineBadgeStyle}>{event.status}</span>
                </div>

                <p style={smallMutedStyle}>
                  {event.created_at} ? {event.source}
                </p>

                {event.message && (
                  <p style={timelineMessageStyle}>{event.message}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={gridStyle}>
        <div style={leftColumnStyle}>


          <section style={safeFlowCardStyle}>
            <h2 style={sectionTitleStyle}>Safe Complete Flow v2</h2>

            <p style={mutedTextStyle}>
              Runs the complete flow and automatically rolls back if QA fails after install.
            </p>

            <label style={labelStyle}>Type APPROVE SAFE FULL FLOW</label>

            <input
              value={safeFlowApproval}
              onChange={(event) => setSafeFlowApproval(event.target.value)}
              style={inputStyle}
            />

            <button
              onClick={runSafeCompleteFlow}
              disabled={safeFlowRunning}
              style={safeFlowButtonStyle}
            >
              {safeFlowRunning ? "Running Safe Flow..." : "Run Safe Complete Flow v2"}
            </button>

            {safeFlowResult && (
              <div style={innerPanelStyle}>
                <p style={safeFlowResult.qa_passed ? successTextStyle : dangerTextStyle}>
                  Status: {safeFlowResult.status || "attention_required"}
                </p>

                <p style={smallMutedStyle}>
                  Generated file: {safeFlowResult.generated_frontend_file || "none"}
                </p>

                <p style={smallMutedStyle}>
                  QA passed: {String(safeFlowResult.qa_passed)}
                </p>

                <p style={smallMutedStyle}>
                  Rollback: {safeFlowResult.rollback_status || "unknown"}
                </p>

                <div style={stepsListStyle}>
                  {(safeFlowResult.steps || []).map((step: any, index: number) => (
                    <div key={index} style={stepCardStyle}>
                      <div style={{ fontWeight: 900 }}>{step.step}</div>
                      <div style={smallMutedStyle}>OK: {String(step.ok)}</div>
                      <div style={smallMutedStyle}>{step.message || "No message"}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section style={completeFlowCardStyle}>
            <h2 style={sectionTitleStyle}>One Click Complete Flow</h2>

            <p style={mutedTextStyle}>
              Runs chain, safe install, QA after install, Feature Registry sync, Project Brain sync, and Handoff export in one flow.
            </p>

            <label style={labelStyle}>Type APPROVE FULL CHAIN FLOW</label>

            <input
              value={completeFlowApproval}
              onChange={(event) => setCompleteFlowApproval(event.target.value)}
              style={inputStyle}
            />

            <button
              onClick={runOneClickCompleteFlow}
              disabled={completeFlowRunning}
              style={completeFlowButtonStyle}
            >
              {completeFlowRunning ? "Running Complete Flow..." : "Run One Click Complete Flow"}
            </button>

            {completeFlowResult && (
              <div style={innerPanelStyle}>
                <p style={completeFlowResult.qa_passed ? successTextStyle : dangerTextStyle}>
                  Status: {completeFlowResult.status || "attention_required"}
                </p>

                <p style={smallMutedStyle}>
                  Generated file: {completeFlowResult.generated_frontend_file || "none"}
                </p>

                <p style={smallMutedStyle}>
                  QA passed: {String(completeFlowResult.qa_passed)}
                </p>

                <div style={stepsListStyle}>
                  {(completeFlowResult.steps || []).map((step: any, index: number) => (
                    <div key={index} style={stepCardStyle}>
                      <div style={{ fontWeight: 900 }}>{step.step}</div>
                      <div style={smallMutedStyle}>
                        OK: {String(step.ok)}
                      </div>
                      <div style={smallMutedStyle}>
                        {step.message || "No message"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

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
            <h2 style={sectionTitleStyle}>New Chat Handoff Export</h2>

            <p style={mutedTextStyle}>
              Export a clean handoff file so a new ChatGPT chat can continue this project without losing exact context.
            </p>

            <button
              onClick={exportNewChatHandoff}
              disabled={handoffRunning}
              style={handoffButtonStyle}
            >
              {handoffRunning ? "Exporting Handoff..." : "Export New Chat Handoff"}
            </button>

            {handoffResult && (
              <div style={innerPanelStyle}>
                <p style={successTextStyle}>Handoff Exported</p>
                <p style={smallMutedStyle}>File: {handoffResult.handoff_file}</p>

                <button
                  onClick={copyHandoffToClipboard}
                  style={copyButtonStyle}
                >
                  Copy Handoff Text
                </button>

                <textarea
                  value={handoffResult.handoff || ""}
                  readOnly
                  rows={12}
                  style={handoffTextAreaStyle}
                />
              </div>
            )}
          </section>

          <section style={cardStyle}>
            <h2 style={sectionTitleStyle}>Project Brain Sync</h2>

            <p style={mutedTextStyle}>
              Save this chain result into Project Brain and Long Memory so new chats understand the latest project state.
            </p>

            <button
              onClick={syncProjectBrain}
              disabled={projectBrainSyncRunning}
              style={projectBrainButtonStyle}
            >
              {projectBrainSyncRunning ? "Updating Project Brain..." : "Update Project Brain"}
            </button>

            {projectBrainSyncResult && (
              <div style={innerPanelStyle}>
                <p style={successTextStyle}>Project Brain Updated</p>
                <p style={smallMutedStyle}>Feature: {projectBrainSyncResult.feature_name}</p>
                <p style={smallMutedStyle}>Route: /{projectBrainSyncResult.target_route}</p>
                <p style={smallMutedStyle}>Synced: {projectBrainSyncResult.synced_at}</p>
              </div>
            )}
          </section>

          <section style={cardStyle}>
            <h2 style={sectionTitleStyle}>Feature Registry Sync</h2>

            <p style={mutedTextStyle}>
              Save this chain result into Feature Registry with route, QA status, install status, rollback status, and generated files.
            </p>

            <button
              onClick={syncFeatureRegistry}
              disabled={registrySyncRunning}
              style={registryButtonStyle}
            >
              {registrySyncRunning ? "Updating Registry..." : "Update Feature Registry"}
            </button>

            {registrySyncResult && (
              <div style={innerPanelStyle}>
                <p style={successTextStyle}>Feature Registry Updated</p>
                <p style={smallMutedStyle}>Feature: {registrySyncResult.feature_name || registrySyncResult.name}</p>
                <p style={smallMutedStyle}>Status: {registrySyncResult.status}</p>
                <p style={smallMutedStyle}>Frontend: {registrySyncResult.frontend_route}</p>
                <p style={smallMutedStyle}>QA: {registrySyncResult.qa_status}</p>
                <p style={smallMutedStyle}>Install: {registrySyncResult.install_status}</p>
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



const registryButtonStyle: CSSProperties = {
  marginTop: "14px",
  padding: "12px 14px",
  borderRadius: "10px",
  fontWeight: 900,
  background: "#164e63",
  color: "white",
  border: "1px solid #67e8f9",
  width: "100%"
};



const projectBrainButtonStyle: CSSProperties = {
  marginTop: "14px",
  padding: "12px 14px",
  borderRadius: "10px",
  fontWeight: 900,
  background: "#312e81",
  color: "white",
  border: "1px solid #a5b4fc",
  width: "100%"
};



const handoffButtonStyle: CSSProperties = {
  marginTop: "14px",
  padding: "12px 14px",
  borderRadius: "10px",
  fontWeight: 900,
  background: "#713f12",
  color: "white",
  border: "1px solid #facc15",
  width: "100%"
};

const copyButtonStyle: CSSProperties = {
  marginTop: "12px",
  padding: "10px 12px",
  borderRadius: "10px",
  fontWeight: 900,
  background: "#0f172a",
  color: "white",
  border: "1px solid #64748b",
  width: "100%"
};

const handoffTextAreaStyle: CSSProperties = {
  width: "100%",
  marginTop: "12px",
  minHeight: "260px",
  padding: "12px",
  borderRadius: "12px",
  background: "#020617",
  color: "#cbd5e1",
  border: "1px solid #263044",
  fontSize: "12px"
};



const completeFlowCardStyle: CSSProperties = {
  border: "1px solid #facc15",
  borderRadius: "20px",
  padding: "20px",
  background: "#0f0a03"
};

const completeFlowButtonStyle: CSSProperties = {
  marginTop: "14px",
  padding: "14px 18px",
  borderRadius: "12px",
  fontWeight: 900,
  background: "#854d0e",
  color: "white",
  border: "1px solid #facc15",
  width: "100%"
};



const safeFlowCardStyle: CSSProperties = {
  border: "1px solid #22c55e",
  borderRadius: "20px",
  padding: "20px",
  background: "#03120a"
};

const safeFlowButtonStyle: CSSProperties = {
  marginTop: "14px",
  padding: "14px 18px",
  borderRadius: "12px",
  fontWeight: 900,
  background: "#14532d",
  color: "white",
  border: "1px solid #86efac",
  width: "100%"
};



const timelinePanelStyle: CSSProperties = {
  border: "1px solid #263044",
  borderRadius: "20px",
  padding: "20px",
  marginBottom: "24px",
  background: "#07111f"
};

const timelineHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "16px",
  alignItems: "center"
};

const timelineListStyle: CSSProperties = {
  display: "grid",
  gap: "12px",
  marginTop: "16px"
};

const timelineItemStyle: CSSProperties = {
  display: "flex",
  gap: "12px",
  alignItems: "flex-start",
  border: "1px solid #263044",
  borderRadius: "14px",
  padding: "12px",
  background: "#020617"
};

const timelineDotStyle: CSSProperties = {
  width: "10px",
  height: "10px",
  borderRadius: "999px",
  background: "#38bdf8",
  marginTop: "5px",
  flexShrink: 0
};

const timelineTitleRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  alignItems: "center"
};

const timelineBadgeStyle: CSSProperties = {
  fontSize: "11px",
  padding: "4px 8px",
  borderRadius: "999px",
  background: "#0f172a",
  color: "#cbd5e1",
  border: "1px solid #263044"
};

const timelineMessageStyle: CSSProperties = {
  color: "#cbd5e1",
  marginTop: "6px",
  fontSize: "13px"
};

