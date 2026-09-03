import { useEffect, useRef, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const SUGGESTIONS = [
  "What did he build at Kraftshala?",
  "Is he available to hire?",
  "What's his strongest backend work?",
];

// One id per browser tab, so the backend can group a conversation.
const newSessionId = () =>
  `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const sessionId = useRef(newSessionId());
  const scrollRef = useRef(null);
  const panelRef = useRef(null);
  const toggleRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
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
    panelRef.current?.querySelector("input")?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const send = async (text) => {
    const question = (text ?? input).trim();
    if (!question || busy) return;

    setError("");
    setInput("");
    setBusy(true);

    // History excludes the message being sent — the server appends it.
    const history = messages.map(({ role, text: t }) => ({ role, text: t }));
    setMessages((prev) => [
      ...prev,
      { role: "user", text: question },
      { role: "model", text: "" },
    ]);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionId.current, message: question, history }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${res.status})`);
      }

      // SSE over a POST response — EventSource can't do POST, so parse the
      // stream by hand. Frames are separated by a blank line.
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
              next[next.length - 1] = {
                role: "model",
                text: next[next.length - 1].text + payload.text,
              };
              return next;
            });
          } else if (event === "error") {
            throw new Error(payload.message);
          }
        }
      }
    } catch (err) {
      setError(err.message);
      // Drop the empty assistant bubble so it isn't left blank.
      setMessages((prev) =>
        prev[prev.length - 1]?.text === "" ? prev.slice(0, -1) : prev
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        className="chat-fab"
        aria-expanded={open}
        aria-controls="chat-panel"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Close" : "Ask about my work"}
      </button>

      <div
        id="chat-panel"
        ref={panelRef}
        className="chat-panel"
        role="dialog"
        aria-label="Ask about Sarvagya's work"
        hidden={!open}
      >
        <div className="chat-header">
          <p>Ask about my work</p>
          <span>Answers come from my documented projects only.</span>
        </div>

        <div className="chat-log" ref={scrollRef} aria-live="polite">
          {messages.length === 0 ? (
            <div className="chat-suggestions">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role}`}>
                {m.text || (busy && i === messages.length - 1 ? "…" : "")}
              </div>
            ))
          )}
          {error ? <p className="chat-error">{error}</p> : null}
        </div>

        <form
          className="chat-input"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <label htmlFor="chat-q" className="sr-only">
            Your question
          </label>
          <input
            id="chat-q"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question…"
            maxLength={1000}
            disabled={busy}
          />
          <button type="submit" disabled={busy || !input.trim()}>
            {busy ? "…" : "Send"}
          </button>
        </form>
      </div>
    </>
  );
};

export default Chatbot;
