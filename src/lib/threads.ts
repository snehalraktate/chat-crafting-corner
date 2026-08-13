import type { UIMessage } from "ai";

export type Thread = {
  id: string;
  title: string;
  updatedAt: number;
  messages: UIMessage[];
};

const KEY = "chat-threads-v1";

export function newId() {
  return Math.random().toString(36).slice(2, 10);
}

export function loadThreads(): Thread[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Thread[]) : [];
    return Array.isArray(parsed) ? parsed.sort((a, b) => b.updatedAt - a.updatedAt) : [];
  } catch {
    return [];
  }
}

export function saveThreads(threads: Thread[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(threads));
  window.dispatchEvent(new Event("threads-changed"));
}

export function getThread(id: string): Thread | undefined {
  return loadThreads().find((t) => t.id === id);
}

export function upsertThread(thread: Thread) {
  const rest = loadThreads().filter((t) => t.id !== thread.id);
  saveThreads([thread, ...rest]);
}

export function deleteThread(id: string) {
  saveThreads(loadThreads().filter((t) => t.id !== id));
}

export function titleFrom(messages: UIMessage[]): string {
  const first = messages.find((m) => m.role === "user");
  const text = first
    ? first.parts.map((p) => (p.type === "text" ? p.text : "")).join(" ").trim()
    : "";
  return text ? text.slice(0, 40) : "New chat";
}
