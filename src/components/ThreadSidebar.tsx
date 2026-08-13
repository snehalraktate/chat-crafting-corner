import { Link, useNavigate } from "@tanstack/react-router";
import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { deleteThread, loadThreads, newId, type Thread } from "@/lib/threads";
import botMark from "@/assets/bot-mark.png";

export function ThreadSidebar({ activeId }: { activeId: string }) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const sync = () => setThreads(loadThreads());
    sync();
    window.addEventListener("threads-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("threads-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, [activeId]);

  return (
    <aside className="hidden w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
      <div className="flex items-center gap-2 px-4 py-4">
        <img src={botMark} alt="" className="h-7 w-7" />
        <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">
          Chatbot
        </span>
      </div>

      <div className="px-3">
        <button
          type="button"
          onClick={() => navigate({ to: "/chat/$threadId", params: { threadId: newId() } })}
          className="flex w-full items-center gap-2 rounded-lg border border-sidebar-border bg-sidebar-accent px-3 py-2 text-sm font-medium text-sidebar-accent-foreground transition-colors hover:border-primary/40"
        >
          <Plus className="h-4 w-4" /> New chat
        </button>
      </div>

      <nav className="mt-4 flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {threads.length === 0 && (
          <p className="px-2 py-3 text-xs text-muted-foreground">No conversations yet.</p>
        )}
        {threads.map((t) => (
          <div
            key={t.id}
            className={cn(
              "group flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors",
              t.id === activeId
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/60",
            )}
          >
            <MessageSquare className="h-4 w-4 shrink-0 opacity-70" />
            <Link
              to="/chat/$threadId"
              params={{ threadId: t.id }}
              className="min-w-0 flex-1 truncate"
            >
              {t.title}
            </Link>
            <button
              type="button"
              aria-label="Delete conversation"
              onClick={() => {
                deleteThread(t.id);
                setThreads(loadThreads());
                if (t.id === activeId) {
                  navigate({ to: "/chat/$threadId", params: { threadId: newId() } });
                }
              }}
              className="opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </nav>
    </aside>
  );
}
