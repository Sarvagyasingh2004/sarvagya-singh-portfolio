"use client";

import { useEffect, useRef, useState } from "react";
import { contactEmail } from "@/constants";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const SUGGESTIONS = [
  "What did he build at Kraftshala?",
  "Walk me through his hardest optimization",
  "Is he available, and for what kind of role?",
  "What can I actually clone and read?",
];

const newSessionId = () =>
  `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const track = (type, meta) => {
  // Fire-and-forget: analytics must never block or break the UI.
  fetch(`${API_URL}/api/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, meta, path: window.location.pathname }),
    keepalive: true,
  }).catch(() => {});
};

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [online, setOnline] = useState(null);

  const sessionId = useRef(newSessionId());
  const logRef = useRef(null);
  const panelRef = useRef(null);
  const toggleRef = useRef(null);
  const abortRef = useRef(null);

  const hasEmail = contactEmail && contactEmail !== "REPLACE_ME";

  // Probe the API once the panel is first opened, so the header can be honest
  // about whether the assistant is actually reachable.
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
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    panelRef.current?.querySelector("textarea")?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Abort any in-flight stream on unmount so we don't write to dead state.
  useEffect(() => () => abortRef.current?.abort(), []);

  const send = async (text) => {
    const question = (text ?? input).trim();
    if (!question || busy) return;

    setError("");
    setInput("");
    setBusy(true);
    track("chat_message", { length: question.length });

    const history = messages.map(({ role, text: t }) => ({ role, text: t }));
    setMessages((prev) => [
      ...prev,
      { role: "user", text: question },
      { role: "model", text: "" },
    ]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionId.current, message: question, history }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${res.status})`);
      }

      // SSE over POST — EventSource is GET-only, so parse the stream by hand.
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const frames = buffer.split("\n\n");
        buffer = frames.pop() ?? "";

        for (const frame of frames) {
          const event = frame.match(/^event: (.*)$/m)?.[1];
          const raw = frame.match(/^data: (.*)$/m)?.[1];
          if (!event || !raw) continue;
          const payload = JSON.parse(raw);

          if (event === "delta") {
            setMessages((prev) => {
              const next = [...prev];
              const last = next[next.length - 1];
              next[next.length - 1] = { role: "model", text: last.text + payload.text };
              return next;
            });
          } else if (event === "error") {
            throw new Error(payload.message);
          }
        }
      }
      setOnline(true);
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(
        err.message === "Failed to fetch"
          ? "Can't reach the assistant right now."
          : err.message
      );
      setOnline(false);
      setMessages((prev) =>
        prev[prev.length - 1]?.text === "" ? prev.slice(0, -1) : prev
      );
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const statusLabel =
    online === null ? "connecting" : online ? "online" : "offline";

  return (
    <>
      <div className="fab-stack">

        <button
          ref={toggleRef}
          type="button"
          className={`fab fab-chat ${open ? "is-open" : ""}`}
          aria-expanded={open}
          aria-controls="chat-panel"
          aria-label={open ? "Close assistant" : "Ask about my work"}
          onClick={() => {
            setOpen((v) => !v);
            if (!open) track("chat_open");
          }}
        >
          {open ? (
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
            </svg>
          ) : (
            <span className="fab-chat-label">
              <span className="fab-pulse" />
              Ask my AI
            </span>
          )}
        </button>
      </div>

      <div
        id="chat-panel"
        ref={panelRef}
        className="chat-shell"
        role="dialog"
        aria-modal="false"
        aria-label="Ask about Sarvagya's work"
        hidden={!open}
      >
        <div className="chat-titlebar">
          <span className="chat-lights" aria-hidden="true">
            <i /><i /><i />
          </span>
          <span className="chat-tty">
            <span className={`chat-dot ${statusLabel}`} />
            sarvagya&nbsp;&mdash;&nbsp;{statusLabel}
          </span>
          <button
            type="button"
            className="chat-close"
            aria-label="Close assistant"
            onClick={() => {
              setOpen(false);
              toggleRef.current?.focus();
            }}
          >
            ✕
          </button>
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
                the whole corpus fits in context. Ask it something specific.
              </p>
              <div className="chat-suggestions">
                {SUGGESTIONS.map((s) => (
                  <button key={s} type="button" onClick={() => send(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="chat-thread" aria-live="polite">
              {messages.map((m, i) => (
                <div key={i} className={`chat-row ${m.role}`}>
                  <span className="chat-who">
                    {m.role === "user" ? "you" : "sarvagya.ai"}
                  </span>
                  <div className="chat-bubble">
                    {m.text || (busy && i === messages.length - 1 ? (
                      <span className="chat-typing" aria-label="Thinking">
                        <i /><i /><i />
                      </span>
                    ) : null)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {error ? (
            <div className="chat-fallback">
              <p>{error}</p>
              {hasEmail ? (
                <a href={`mailto:${contactEmail}`}>Email me instead</a>
              ) : null}
            </div>
          ) : null}
        </div>

        <form
          className="chat-composer"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <label htmlFor="chat-q" className="sr-only">
            Your question
          </label>
          <textarea
            id="chat-q"
            rows="1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
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
