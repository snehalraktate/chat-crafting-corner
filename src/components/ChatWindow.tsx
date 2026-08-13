import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputFooter,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { titleFrom, upsertThread, type Thread } from "@/lib/threads";
import botMark from "@/assets/bot-mark.png";

const transport = new DefaultChatTransport({ api: "/api/chat" });

const suggestions = [
  "Explain quantum computing simply",
  "Draft a polite follow-up email",
  "Give me a 20-minute workout plan",
  "Summarize the pros and cons of remote work",
];

export function ChatWindow({ thread }: { thread: Thread }) {
  const { messages, sendMessage, status } = useChat({
    id: thread.id,
    messages: thread.messages,
    transport,
    onError: (error) => toast.error(error.message || "Something went wrong"),
  });

  const formRef = useRef<HTMLDivElement>(null);
  const isBusy = status === "submitted" || status === "streaming";

  useEffect(() => {
    formRef.current?.querySelector("textarea")?.focus();
  }, [thread.id, status]);

  useEffect(() => {
    if (messages.length === 0) return;
    upsertThread({
      id: thread.id,
      title: titleFrom(messages as UIMessage[]),
      updatedAt: Date.now(),
      messages: messages as UIMessage[],
    });
  }, [messages, thread.id]);

  const send = (text: string) => {
    const value = text.trim();
    if (!value || isBusy) return;
    void sendMessage({ text: value });
  };

  return (
    <div className="flex h-full flex-col">
      <Conversation className="flex-1">
        <ConversationContent className="mx-auto w-full max-w-3xl gap-8 px-4 py-8">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center gap-6 pt-16 text-center">
              <img src={botMark} alt="Assistant logo" className="h-16 w-16" />
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">How can I help today?</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Ask anything — your chats stay saved in this browser.
                </p>
              </div>
              <div className="grid w-full gap-2 sm:grid-cols-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-xl border border-border bg-card px-4 py-3 text-left text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <Message key={message.id} from={message.role}>
                <MessageContent>
                  {message.parts.map((part, i) =>
                    part.type === "text" ? (
                      <MessageResponse key={i}>{part.text}</MessageResponse>
                    ) : null,
                  )}
                </MessageContent>
              </Message>
            ))
          )}
          {status === "submitted" && (
            <Message from="assistant">
              <MessageContent>
                <Shimmer>Thinking...</Shimmer>
              </MessageContent>
            </Message>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div ref={formRef} className="border-t border-border bg-background/80 px-4 py-4 backdrop-blur">
        <PromptInput
          className="mx-auto w-full max-w-3xl"
          onSubmit={(message) => send(message.text ?? "")}
        >
          <PromptInputTextarea placeholder="Message the assistant..." />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit status={status} disabled={isBusy} />
          </PromptInputFooter>
        </PromptInput>
        <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-muted-foreground">
          Responses can be inaccurate. Verify important information.
        </p>
      </div>
    </div>
  );
}
