"use client";
import { useEffect, useSyncExternalStore } from "react";
import { Project, newProject, projectSchema } from "../domain/schema";
import {
  Workspace,
  migrateLegacy,
  workspaceSchema,
} from "../domain/persistence";

const KEY = "canvasiq-workspace-v2";
type State = {
  workspace: Workspace;
  ready: boolean;
  error: string;
  notice: string;
  theme: "light" | "dark";
  recovery: string | null;
};
const initial = newProject("first-project");
const server: State = {
  workspace: { version: 2, activeId: initial.id, projects: [initial] },
  ready: false,
  error: "",
  notice: "",
  theme: "light",
  recovery: null,
};
let state: State = server;
const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};
function emit(next: State) {
  state = next;
  listeners.forEach((fn) => fn());
}
function persist(workspace: Workspace, notice = "Saved in this browser") {
  if (state.recovery !== null) return;
  const parsed = workspaceSchema.parse(workspace);
  try {
    localStorage.setItem(KEY, JSON.stringify(parsed));
    emit({ ...state, workspace: parsed, error: "", notice });
  } catch {
    emit({
      ...state,
      workspace: parsed,
      error:
        "Browser storage is unavailable or full. Export your project to avoid losing changes.",
      notice: "",
    });
  }
}
export function hydrate() {
  if (state.ready) return;
  let recoverySource = "Browser storage could not be accessed.";
  try {
    const raw = localStorage.getItem(KEY),
      legacy = localStorage.getItem("ai-roi-canvas-storage");
    recoverySource = JSON.stringify({ workspace: raw, legacy }, null, 2);
    let workspace = server.workspace,
      notice = "Saved in this browser";
    if (raw) workspace = workspaceSchema.parse(JSON.parse(raw));
    else if (legacy) {
      const p = migrateLegacy(legacy);
      workspace = { version: 2, activeId: p.id, projects: [p] };
      notice =
        "Legacy project imported. Review funding and delivery assumptions; original data retained.";
    }
    const theme =
      localStorage.getItem("canvasiq-theme") === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    emit({ ...state, workspace, ready: true, notice, theme });
  } catch {
    emit({
      ...state,
      ready: true,
      recovery: recoverySource,
      error:
        "Saved data could not be read. Changes are paused to preserve the original. Download a recovery copy before starting fresh.",
    });
  }
}
export function startFreshAfterRecovery() {
  const p = newProject();
  const workspace: Workspace = { version: 2, activeId: p.id, projects: [p] };
  try {
    localStorage.setItem(KEY, JSON.stringify(workspace));
    emit({
      ...state,
      workspace,
      recovery: null,
      error: "",
      notice: "Fresh workspace created",
    });
  } catch {
    emit({
      ...state,
      error:
        "Browser storage is still unavailable. Keep your recovery copy and enable storage before continuing.",
    });
  }
}
export function useWorkspace() {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => state,
    () => server,
  );
  useEffect(hydrate, []);
  return snapshot;
}
export function currentProject() {
  return state.workspace.projects.find(
    (p) => p.id === state.workspace.activeId,
  )!;
}
export function updateProject(change: (p: Project) => void) {
  const p = structuredClone(currentProject());
  change(p);
  const parsed = projectSchema.parse(p);
  persist({
    ...state.workspace,
    projects: state.workspace.projects.map((item) =>
      item.id === p.id ? parsed : item,
    ),
  });
}
export function addProject(p: Project) {
  if (state.workspace.projects.length >= 10)
    throw new Error(
      "Export and remove a project before adding another (limit 10).",
    );
  const copy = projectSchema.parse({ ...p, id: crypto.randomUUID() });
  persist(
    {
      ...state.workspace,
      activeId: copy.id,
      projects: [...state.workspace.projects, copy],
    },
    "Project added and saved locally",
  );
}
export function switchProject(id: string) {
  persist({ ...state.workspace, activeId: id });
}
export function removeProject() {
  const remaining = state.workspace.projects.filter(
    (p) => p.id !== state.workspace.activeId,
  );
  if (!remaining.length) remaining.push(newProject());
  persist(
    { version: 2, activeId: remaining[0].id, projects: remaining },
    "Project removed",
  );
}
export function setTheme(theme: "light" | "dark") {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem("canvasiq-theme", theme);
  } catch {}
  emit({ ...state, theme });
}
