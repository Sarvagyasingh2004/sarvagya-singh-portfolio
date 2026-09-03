import { useEffect, useRef, useState } from "react";
import { whatsappNumber, contactEmail } from "../../constants/index.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

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

  const hasWhatsapp = whatsappNumber && whatsappNumber !== "REPLACE_ME";
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
        {hasWhatsapp ? (
          <a
            className="fab fab-whatsapp"
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
              "Hi Sarvagya — I found your portfolio."
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Message Sarvagya on WhatsApp"
            onClick={() => track("whatsapp_click")}
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.347-.347.52-.52.174-.174.232-.298.347-.497.115-.199.058-.372-.03-.52-.086-.15-.66-1.59-.905-2.178-.238-.571-.48-.492-.66-.501-.17-.008-.365-.01-.56-.01a1.08 1.08 0 0 0-.783.367C6.9 7.6 6.2 8.4 6.2 9.9c0 1.5 1.05 2.95 1.2 3.15.15.2 2.05 3.3 5.05 4.5 2.5 1 3 .8 3.55.75.55-.05 1.75-.7 2-1.4.25-.7.25-1.3.175-1.425-.075-.125-.273-.2-.57-.35zM12.05 21.5h-.005a9.87 9.87 0 0 1-5.03-1.378l-.36-.214-3.74.98 1-3.65-.235-.375A9.86 9.86 0 0 1 2.1 11.65c0-5.462 4.443-9.9 9.905-9.9a9.84 9.84 0 0 1 7.005 2.9 9.82 9.82 0 0 1 2.9 7.005c-.003 5.462-4.446 9.845-9.86 9.845zM20.52 3.449A11.8 11.8 0 0 0 12.045 0C5.463 0 .104 5.36.102 11.944c0 2.096.547 4.142 1.588 5.945L0 24l6.256-1.641a11.9 11.9 0 0 0 5.683 1.448h.005c6.582 0 11.94-5.36 11.943-11.945a11.87 11.87 0 0 0-3.367-8.413z" />
            </svg>
          </a>
        ) : null}

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
              {hasWhatsapp ? (
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>
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
