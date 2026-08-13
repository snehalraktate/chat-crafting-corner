import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { loadThreads, newId } from "@/lib/threads";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Chatboat — Fast, friendly assistant" },
      { name: "description", content: "Chatboat: a fast, friendly AI assistant with saved conversation threads in your browser." },
      { property: "og:title", content: "Chatboat — Fast, friendly assistant" },
      { property: "og:description", content: "Chatboat: a fast, friendly AI assistant with saved conversation threads." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    const threads = loadThreads();
    const id = threads[0]?.id ?? newId();
    void navigate({ to: "/chat/$threadId", params: { threadId: id }, replace: true });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">Opening your chat…</p>
    </div>
  );
}
