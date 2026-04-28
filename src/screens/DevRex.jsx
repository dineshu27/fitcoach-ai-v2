import { useState } from "react";
import REX from "../components/REX";
import { useRexState } from "../motion/useRexState";

const STATES = ["idle", "thinking", "talking", "celebrating", "warning"];

export default function DevRex() {
  const { state, show } = useRexState("idle");
  return (
    <div style={{ padding: "24px 20px 80px", background: "var(--c-bg)", minHeight: "100vh" }}>
      <p style={{ fontSize: 20, fontWeight: 800, color: "var(--c-text)", marginBottom: 4 }}>REX States</p>
      <p style={{ fontSize: 12, color: "var(--c-sub)", marginBottom: 32 }}>DEV only — /dev/rex</p>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
        <REX state={state} size="md" />
      </div>
      <p style={{ textAlign: "center", fontSize: 14, color: "var(--c-accent)", fontWeight: 700, marginBottom: 24 }}>Current: {state}</p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
        {STATES.map(s => (
          <button key={s} onClick={() => show(s, 3000)}
            style={{ padding: "10px 18px", borderRadius: 12, background: state === s ? "var(--c-accent)" : "var(--c-card)", color: state === s ? "#fff" : "var(--c-text)", fontWeight: 600, fontSize: 13, border: "1px solid var(--c-border)", cursor: "pointer" }}>
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
