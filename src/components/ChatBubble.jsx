import REX from "./REX";

export default function ChatBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {!isUser && (
        <div className="flex-shrink-0 mb-1" style={{ transform: "scale(0.5)", transformOrigin: "bottom left", width: 60, height: 60, marginLeft: -10, marginBottom: -5 }}>
          <REX state="idle" size="sm" />
        </div>
      )}
      <div
        className="max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
        style={isUser ? {
          background: "linear-gradient(135deg, #6C63FF, #5B52E5)",
          borderRadius: "18px 18px 4px 18px",
          color: "#F0F0FF",
          boxShadow: "0 0 15px rgba(108,99,255,0.3)",
        } : {
          background: "rgba(26,26,38,0.9)",
          border: "1px solid rgba(108,99,255,0.25)",
          borderRadius: "18px 18px 18px 4px",
          color: "#F0F0FF",
        }}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="flex-shrink-0 mb-1" style={{ transform: "scale(0.5)", transformOrigin: "bottom left", width: 60, height: 60, marginLeft: -10, marginBottom: -5 }}>
        <REX state="thinking" size="sm" />
      </div>
      <div className="rounded-2xl px-4 py-3" style={{ background: "rgba(26,26,38,0.9)", border: "1px solid rgba(108,99,255,0.25)" }}>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-2 w-2 rounded-full animate-bounce"
              style={{ background: "#6C63FF", animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
