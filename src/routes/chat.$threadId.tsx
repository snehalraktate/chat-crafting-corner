import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { ChatWindow } from "@/components/ChatWindow";
import { ThreadSidebar } from "@/components/ThreadSidebar";
import { getThread, type Thread } from "@/lib/threads";

export const Route = createFileRoute("/chat/$threadId")({
  head: () => ({
    meta: [
      { title: "Chat — Chatboat" },
      { name: "description", content: "Chat with Chatboat. Conversations stay saved in your browser." },
      { property: "og:title", content: "Chat — Chatboat" },
      { property: "og:description", content: "Chat with Chatboat, with saved conversation threads." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const { threadId } = Route.useParams();
  const [thread, setThread] = useState<Thread | null>(null);

  useEffect(() => {
    setThread(getThread(threadId) ?? { id: threadId, title: "New chat", updatedAt: Date.now(), messages: [] });
  }, [threadId]);

  return (
    <div className="flex h-screen bg-background">
      <ThreadSidebar activeId={threadId} />
      <main className="flex min-w-0 flex-1 flex-col">
        {thread && <ChatWindow key={thread.id} thread={thread} />}
      </main>
    </div>
  );
}
