"use client";

import { useEffect, useRef, useState } from "react";
import { contactEmail } from "@/constants";

// API routes are same-origin now — no cross-origin base URL, no CORS.
const API_URL = "";

const SUGGESTIONS = [
  "What did he build at Kraftshala?",
  "Walk me through his hardest optimization",
  "Is he available, and for what role?",
  "What can I actually clone and read?",
];

const newSessionId = () =>
  `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const track = (type: string, meta?: Record<string, unknown>) => {
  fetch(`${API_URL}/api/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, meta, path: window.location.pathname }),
    keepalive: true,
  }).catch(() => {});
};

type Msg = { role: "user" | "model"; text: string };

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [online, setOnline] = useState<boolean | null>(null);

  const sessionId = useRef(newSessionId());
  const logRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!open || online !== null) return;
    fetch(`${API_URL}/api/health`)
      .then((r) => r.json())
      .then((d) => setOnline(Boolean(d?.features?.chat)))
      .catch(() => setOnline(false));
  }, [open, online]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [messages]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        fabRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    panelRef.current?.querySelector("textarea")?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const send = async (text?: string) => {
    const q = (text ?? input).trim();
    if (!q || busy) return;

    setError("");
    setInput("");
    setBusy(true);
    track("chat_message", { length: q.length });

    const history = messages.map(({ role, text: t }) => ({ role, text: t }));
    setMessages((p) => [...p, { role: "user", text: q }, { role: "model", text: "" }]);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionId.current, message: q, history }),
        signal: ctrl.signal,
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error || `Request failed (${res.status})`);
      }

      // SSE over POST — EventSource is GET-only, so parse the stream by hand.
      const reader = res.body!.getReader();
      const dec = new TextDecoder();
      let buf = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const frames = buf.split("\n\n");
        buf = frames.pop() ?? "";
        for (const f of frames) {
          const ev = f.match(/^event: (.*)$/m)?.[1];
          const raw = f.match(/^data: (.*)$/m)?.[1];
          if (!ev || !raw) continue;
          const payload = JSON.parse(raw);
          if (ev === "delta") {
            setMessages((p) => {
              const n = [...p];
              n[n.length - 1] = { role: "model", text: n[n.length - 1].text + payload.text };
              return n;
            });
          } else if (ev === "error") throw new Error(payload.message);
        }
      }
      setOnline(true);
    } catch (err) {
      const e = err as Error;
      if (e.name === "AbortError") return;
      setError(
        e.message === "Failed to fetch" ? "Can't reach the assistant right now." : e.message
      );
      setOnline(false);
      setMessages((p) => (p[p.length - 1]?.text === "" ? p.slice(0, -1) : p));
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  };

  const status = online === null ? "connecting" : online ? "online" : "offline";

  return (
    <>
      <button
        ref={fabRef}
        type="button"
        className={`chat-fab ${open ? "is-open" : ""}`}
        aria-expanded={open}
        aria-controls="chat-panel"
        aria-label={open ? "Close assistant" : "Ask my AI about my work"}
        onClick={() => {
          setOpen((v) => !v);
          if (!open) track("chat_open");
        }}
      >
        {open ? (
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8A8.5 8.5 0 0 1 12.5 20a8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7A8.4 8.4 0 0 1 4 11.5 8.5 8.5 0 0 1 8.7 3.9a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z" />
          </svg>
        )}
        {!open ? <span className="chat-fab-pulse" aria-hidden="true" /> : null}
      </button>

      <div
        id="chat-panel"
        ref={panelRef}
        className="chat-shell"
        role="dialog"
        aria-label="Ask about Sarvagya's work"
        hidden={!open}
      >
        <div className="chat-titlebar">
          <span className="chat-lights" aria-hidden="true"><i /><i /><i /></span>
          <span className="chat-tty">
            <span className={`chat-dot ${status}`} />
            sarvagya.ai &mdash; {status}
          </span>
        </div>

        <div className="chat-log" ref={logRef}>
          {messages.length === 0 ? (
            <div className="chat-intro">
              <p className="chat-intro-lead">
                This is the second chatbot I&rsquo;ve shipped. The first ran in
                production at BWS.
              </p>
              <p className="chat-intro-sub">
                It answers only from my documented work &mdash; no vector store,
                the whole corpus fits in context.
              </p>
              <div className="chat-suggestions">
                {SUGGESTIONS.map((s) => (
                  <button key={s} type="button" onClick={() => send(s)}>{s}</button>
                ))}
              </div>
            </div>
          ) : (
            <div className="chat-thread" aria-live="polite">
              {messages.map((m, i) => (
                <div key={i} className={`chat-row ${m.role}`}>
                  <span className="chat-who">{m.role === "user" ? "you" : "sarvagya.ai"}</span>
                  <div className="chat-bubble">
                    {m.text || (busy && i === messages.length - 1 ? (
                      <span className="chat-typing" aria-label="Thinking"><i /><i /><i /></span>
                    ) : null)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {error ? (
            <div className="chat-fallback">
              <p>{error}</p>
              <a href={`mailto:${contactEmail}`}>Email me instead</a>
            </div>
          ) : null}
        </div>

        <form className="chat-composer" onSubmit={(e) => { e.preventDefault(); send(); }}>
          <label htmlFor="chat-q" className="sr-only">Your question</label>
          <textarea
            id="chat-q"
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
            }}
            placeholder="Ask about a system, a tradeoff, availability…"
            maxLength={1000}
            disabled={busy}
          />
          <button type="submit" disabled={busy || !input.trim()} aria-label="Send">
            {busy ? "…" : "↵"}
          </button>
        </form>
      </div>
    </>
  );
};

export default Chatbot;
