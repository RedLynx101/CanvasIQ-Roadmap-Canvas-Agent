"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChartNoAxesCombined,
  ClipboardList,
  Columns3,
  FileText,
  Layers3,
  Menu,
  Moon,
  Plus,
  SearchCheck,
  SlidersHorizontal,
  Sun,
  Upload,
  WandSparkles,
  X,
} from "lucide-react";
import {
  addProject,
  removeProject,
  setTheme,
  switchProject,
  useWorkspace,
  startFreshAfterRecovery,
} from "../store/workspace";
import { newProject } from "../domain/schema";
import { MAX_PROJECT_BYTES, parseProject } from "../domain/persistence";
import { exampleProject } from "../data/example";
import { Brief } from "./brief";
import { Initiatives } from "./initiatives";
import { Compare } from "./compare";
import { Portfolio } from "./portfolio";
import { Roadmap } from "./roadmap";
import { EvidenceLedger } from "./evidence";
import { Decision } from "./decision";
import { Assistant } from "./assistant";
import { Button, Empty, Mark, download } from "./shared";
const sections = [
  {
    id: "brief",
    label: "Strategy brief",
    href: "/brief",
    icon: ClipboardList,
    description: "Define the outcome and the resources behind it.",
  },
  {
    id: "initiatives",
    label: "Initiatives",
    href: "/initiatives",
    icon: Layers3,
    description: "Build a register of opportunities worth evaluating.",
  },
  {
    id: "compare",
    label: "Compare",
    href: "/compare",
    icon: ChartNoAxesCombined,
    description: "Understand the value. Challenge the assumptions.",
  },
  {
    id: "portfolio",
    label: "Portfolio",
    href: "/portfolio",
    icon: Columns3,
    description: "Select a portfolio that earns its investment.",
  },
  {
    id: "roadmap",
    label: "Roadmap",
    href: "/roadmap",
    icon: SlidersHorizontal,
    description: "Turn the selection into a feasible delivery plan.",
  },
  {
    id: "evidence",
    label: "Evidence",
    href: "/evidence",
    icon: SearchCheck,
    description: "Keep the reasoning behind the numbers.",
  },
  {
    id: "canvas",
    label: "Decision brief",
    href: "/canvas",
    icon: FileText,
    description: "A clear decision, with the evidence to support it.",
  },
];
export type View = (typeof sections)[number]["id"];
export function Workbench({ view = "compare" }: { view?: View }) {
  const state = useWorkspace(),
    p = state.workspace.projects.find(
      (p) => p.id === state.workspace.activeId,
    )!;
  const [menu, setMenu] = useState(false),
    [assistant, setAssistant] = useState(false),
    [error, setError] = useState("");
  const file = useRef<HTMLInputElement>(null);
  const active = sections.find((s) => s.id === view) ?? sections[2];
  const add = (demo = false) => {
    try {
      addProject(demo ? exampleProject() : newProject());
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to workspace
      </a>
      <aside
        id="workspace-navigation"
        className={`sidebar no-print ${menu ? "open" : ""}`}
      >
        <div className="brand">
          <Link href="/compare" aria-label="CanvasIQ workspace">
            <Mark />
            <span>
              Canvas<span className="brand-iq">IQ</span>
            </span>
          </Link>
          <button
            className="mobile-close"
            aria-label="Close navigation"
            onClick={() => setMenu(false)}
          >
            <X size={20} />
          </button>
        </div>
        <div className="workspace-label">
          <span className="eyebrow">YOUR WORKSPACE</span>
          <span className="local-dot">Local</span>
        </div>
        <label className="project-switch">
          <span className="sr-only">Active project</span>
          <select value={p.id} onChange={(e) => switchProject(e.target.value)}>
            {state.workspace.projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <nav aria-label="Planning steps">
          {sections.map((s, index) => (
            <Link
              key={s.id}
              href={s.href}
              className={s.id === view ? "active" : ""}
              aria-current={s.id === view ? "page" : undefined}
              onClick={() => setMenu(false)}
            >
              <s.icon size={18} />
              <span>{s.label}</span>
              <small>0{index + 1}</small>
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Button variant="ghost" onClick={() => add()}>
            <Plus size={16} />
            New project
          </Button>
          <Button variant="ghost" onClick={() => file.current?.click()}>
            <Upload size={16} />
            Import project
          </Button>
          <Button variant="ghost" onClick={() => add(true)}>
            Open example strategy
          </Button>
          <p>
            Built for better decisions.
            <br />
            <span>Designed by Noah Hicks.</span>
          </p>
          <div className="sidebar-meta">
            <span>CanvasIQ / 2.0</span>
            <Button
              variant="icon ghost"
              aria-label={`Switch to ${state.theme === "light" ? "dark" : "light"} theme`}
              onClick={() =>
                setTheme(state.theme === "light" ? "dark" : "light")
              }
            >
              {state.theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
            </Button>
          </div>
        </div>
      </aside>
      {menu && (
        <button
          className="nav-scrim"
          aria-label="Close navigation"
          onClick={() => setMenu(false)}
        />
      )}
      <div className="workspace">
        <header className="topbar no-print">
          <button
            className="mobile-menu"
            aria-label="Open navigation"
            aria-expanded={menu}
            aria-controls="workspace-navigation"
            onClick={() => setMenu(true)}
          >
            <Menu size={21} />
          </button>
          <div className="breadcrumb">
            <span>{p.organization || "Your strategy"}</span>
            <span>/</span>
            <strong>{active.label}</strong>
          </div>
          <div className="topbar-actions">
            <span className="save-indicator" title={state.notice}>
              <span />
              {state.error ? "Save needs attention" : "Saved locally"}
            </span>
            <Button variant="secondary" onClick={() => setAssistant(true)}>
              <WandSparkles size={16} />
              Ask CanvasIQ
            </Button>
          </div>
        </header>
        <main id="main" tabIndex={-1}>
          <div className="page-heading no-print">
            <div>
              <span className="eyebrow">
                {p.synthetic
                  ? "EXAMPLE WORKSPACE · SYNTHETIC DATA"
                  : "STRATEGY WORKSPACE"}
              </span>
              <h1>{active.label}</h1>
              <p>{active.description}</p>
            </div>
            {view !== "canvas" && (
              <Link
                className="text-button next-step"
                href={
                  sections[
                    Math.min(sections.findIndex((s) => s.id === view) + 1, 6)
                  ].href
                }
              >
                Next step <ArrowRight size={16} />
              </Link>
            )}
          </div>
          {(error || state.error) && (
            <div role="alert" className="alert">
              {error || state.error}
            </div>
          )}
          {!state.ready ? (
            <p role="status">Opening your workspace…</p>
          ) : state.recovery !== null ? (
            <Empty
              title="Recover your saved workspace"
              action={
                <div className="empty-actions">
                  <Button
                    onClick={() =>
                      download(state.recovery!, "canvasiq-recovery.json")
                    }
                  >
                    Download recovery copy
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      if (
                        confirm(
                          "Start a fresh workspace? Download the recovery copy first if you want to keep the unreadable saved data.",
                        )
                      )
                        startFreshAfterRecovery();
                    }}
                  >
                    Start fresh
                  </Button>
                </div>
              }
            >
              The original saved data is unchanged. Export a recovery copy for
              inspection, or explicitly start a fresh workspace.
            </Empty>
          ) : (
            <div key={`${p.id}-${view}`} className="page-content">
              {!p.initiatives.length &&
              view !== "brief" &&
              view !== "initiatives" ? (
                <Empty
                  title="Start with a decision"
                  action={
                    <div className="empty-actions">
                      <Button onClick={() => add(true)}>
                        Explore an example <ArrowRight size={16} />
                      </Button>
                      <Link className="button secondary" href="/brief">
                        Build your own
                      </Link>
                    </div>
                  }
                >
                  Compare a complete synthetic strategy, or begin with your own
                  brief. No API key needed.
                </Empty>
              ) : view === "brief" ? (
                <Brief project={p} />
              ) : view === "initiatives" ? (
                <Initiatives project={p} />
              ) : view === "compare" ? (
                <Compare project={p} />
              ) : view === "portfolio" ? (
                <Portfolio project={p} />
              ) : view === "roadmap" ? (
                <Roadmap project={p} />
              ) : view === "evidence" ? (
                <EvidenceLedger project={p} />
              ) : (
                <Decision project={p} />
              )}
            </div>
          )}
          <footer className="workspace-footer no-print">
            <span>
              Browser-local workspace · export a JSON backup to keep your work.
            </span>
            <button
              className="text-button danger"
              onClick={() => {
                if (
                  confirm(
                    "Remove the current project from this browser? Export a JSON backup first if you want to keep it.",
                  )
                )
                  removeProject();
              }}
            >
              Remove project
            </button>
          </footer>
        </main>
      </div>
      <input
        className="sr-only"
        ref={file}
        type="file"
        accept=".json,application/json"
        aria-label="Import project file"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          try {
            if (f.size > MAX_PROJECT_BYTES)
              throw new Error("Project file exceeds 20 MB.");
            addProject(parseProject(await f.text()));
            setError("");
          } catch {
            setError(
              "Could not import this file. Use a valid CanvasIQ v2 project JSON (up to 20 MB). Existing projects are unchanged.",
            );
          }
          e.target.value = "";
        }}
      />
      {assistant && (
        <Assistant key={p.id} project={p} onClose={() => setAssistant(false)} />
      )}
    </div>
  );
}
