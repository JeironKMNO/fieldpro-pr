"use client";

interface AgentMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export function AgentMessage({
  role,
  content,
  isStreaming,
}: AgentMessageProps) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-teal-600 px-4 py-2.5 text-sm text-white shadow-sm">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="flex max-w-[80%] gap-2.5">
        <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700">
          ✦
        </div>
        <div className="rounded-2xl rounded-tl-sm border border-gray-100 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm">
          {content ? (
            <div className="whitespace-pre-wrap leading-relaxed">{content}</div>
          ) : null}
          {isStreaming && (
            <span className="ml-1 inline-flex gap-0.5">
              <span
                className="animate-bounce"
                style={{ animationDelay: "0ms" }}
              >
                ·
              </span>
              <span
                className="animate-bounce"
                style={{ animationDelay: "150ms" }}
              >
                ·
              </span>
              <span
                className="animate-bounce"
                style={{ animationDelay: "300ms" }}
              >
                ·
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
