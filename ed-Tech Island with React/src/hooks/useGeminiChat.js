import { useState, useCallback, useRef } from "react";
import {
  buildSessionContext, trackTopic, incrementMessages,
  refreshSessionSummary, getSession
} from "./useAriaSession";
import { screenCapture } from "./useScreenCapture";

const MODEL = "gemini-3.5-flash-lite";

function getApiKey() {
  return localStorage.getItem("aria_gemini_key") || import.meta.env.VITE_GEMINI_API_KEY || "";
}

const MAX_HISTORY = 10;
const SUMMARY_EVERY = 5; // refresh session summary every N messages

/* ÔöÇÔöÇ Fast page context (targeted elements, no body.innerText freeze) ÔöÇÔöÇ */
function getScreenContent() {
  try {
    const parts = [`Page: "${document.title}" (${window.location.pathname})`];
    const h = document.querySelector("h1, h2");
    if (h?.textContent?.trim()) parts.push(`Section: ${h.textContent.trim().slice(0, 80)}`);
    const main = document.querySelector("main,[role=main],article,.view-container,[class*=courses],[class*=dashboard],[class*=content]");
    if (main) {
      const nodes = main.querySelectorAll("h1,h2,h3,h4,p,li,[class*=title],[class*=chapter],[class*=subject],[class*=topic],[class*=course]");
      const texts = []; let len = 0;
      for (const el of nodes) {
        if (len > 380) break;
        const t = (el.textContent || "").replace(/\s+/g, " ").trim();
        if (t.length > 3 && t.length < 140) { texts.push(t); len += t.length; }
      }
      if (texts.length) parts.push(`Visible: ${texts.slice(0, 8).join(" | ")}`);
    }
    return parts.join("\n").slice(0, 480);
  } catch { return `Page: ${document.title}`; }
}

/* ÔöÇÔöÇ Student info ÔöÇÔöÇ */
function getStudentInfo() {
  try {
    const u = JSON.parse(localStorage.getItem("edtech_user") || "{}");
    const b = JSON.parse(localStorage.getItem("edtech_school_branding") || "{}");
    return { name: u.name || "Student", cls: u.class_name || "Class 6", school: b.school_name || "EdTech Island" };
  } catch { return { name: "Student", cls: "Class 6", school: "EdTech Island" }; }
}

/* ÔöÇÔöÇ Parse SSE line ÔöÇÔöÇ */
function parseSSE(line) {
  if (!line.startsWith("data: ")) return "";
  const j = line.slice(6).trim();
  if (!j || j === "[DONE]") return "";
  try { return JSON.parse(j)?.candidates?.[0]?.content?.parts?.[0]?.text || ""; }
  catch { return ""; }
}

let _id = 0;

export default function useGeminiChat() {
  const [messages,  setMessages ] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError    ] = useState(null);
  const historyRef = useRef([]);
  const msgCountRef = useRef(0);

  const sendMessage = useCallback(async (userText, screenshotBase64 = null) => {
    const text = userText?.trim();
    if (!text) return null;

    const apiKey = getApiKey();
    if (!apiKey || apiKey === "YOUR_KEY_HERE" || apiKey === "YOUR_GEMINI_API_KEY") {
      const w = "Gemini API key not set. Please provide your Gemini API key.";
      setMessages(prev => [...prev, { role:"user", text }, { role:"model", text: w }]);
      return null;
    }

    setMessages(prev => [...prev, { role:"user", text, hasScreenshot: !!screenshotBase64 }]);
    setIsLoading(true); setError(null);

    // Track the page as a topic in session
    const pageTitle = document.title;
    if (pageTitle) trackTopic(pageTitle);
    incrementMessages();

    // Auto-capture from persistent stream (if active) OR use manual screenshot
    const autoFrame    = screenshotBase64 ?? (screenCapture.isActive() ? screenCapture.capture() : null);
    const hasVisual    = !!autoFrame;
    const screen       = getScreenContent();

    // Build user parts
    const userParts = [
      { text: `[Screen context: ${screen}]` },
      { text },
    ];
    if (autoFrame) {
      userParts.push({ inline_data: { mime_type: "image/jpeg", data: autoFrame } });
    }

    // Rolling history (plain text only)
    historyRef.current.push({ role: "user", parts: [{ text }] });
    if (historyRef.current.length > MAX_HISTORY) historyRef.current = historyRef.current.slice(-MAX_HISTORY);

    const contents = [
      ...historyRef.current.slice(0, -1),
      { role: "user", parts: userParts },
    ];

    // Build system prompt with session memory
    const s    = getStudentInfo();
    const sess = buildSessionContext(); // cross-portal / cross-day memory

    const systemText =
`You are Aria, an AI tutor for ${s.school}. You are tutoring ${s.name} (${s.cls}).

CONTEXT:
${sess ? sess + "\n" : ""}You receive [Screen context] with every message — use it to give specific, relevant help.

RULES (STRICT):
- NO emojis, NO markdown, NO asterisks, NO bullets, NO symbols like *, **, ##, #, -, >, etc.
- Write in plain conversational sentences only, like speaking to a student.
- Guide with Socratic hints — help the student think, do not give full answers directly.
- Keep replies under 55 words.
- Reference what is on screen when relevant.
- End with a short question or encouragement.
- Indian-friendly English tone is fine.`;

    const streamId = ++_id;
    setMessages(prev => [...prev, { role:"model", text:"", streaming:true, id:streamId }]);
    setIsLoading(false);

    let accumulated = "";
    try {
      const streamUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent?alt=sse&key=${apiKey}`;
      const res = await fetch(streamUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemText }] },
          contents,
          generationConfig: { temperature: 0.6, maxOutputTokens: 150, topP: 0.9 },
        }),
      });

      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e?.error?.message || `HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const dec    = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let nl;
        while ((nl = buf.indexOf("\n")) !== -1) {
          const line = buf.slice(0, nl).trim(); buf = buf.slice(nl + 1);
          const tok = parseSSE(line);
          if (tok) {
            accumulated += tok;
            setMessages(prev => prev.map(m => m.id === streamId ? { ...m, text: accumulated } : m));
          }
        }
      }

      setMessages(prev => prev.map(m => m.id === streamId ? { ...m, streaming: false } : m));
      if (accumulated) historyRef.current.push({ role:"model", parts:[{ text: accumulated }] });

      // Refresh session summary every N messages (runs silently in background)
      msgCountRef.current++;
      if (msgCountRef.current % SUMMARY_EVERY === 0) {
        const allMsgs = [...historyRef.current.map(h => ({ role: h.role, text: h.parts[0].text }))];
        refreshSessionSummary(allMsgs).catch(() => {});
      }

      return accumulated || null;

    } catch (err) {
      const msg = `Could not get a response: ${err.message}`;
      setError(msg);
      setMessages(prev => prev.map(m => m.id === streamId ? { ...m, text: msg, streaming: false } : m));
      return null;
    }
  }, []);

  const clearHistory = useCallback(() => {
    setMessages([]); historyRef.current = []; msgCountRef.current = 0; setError(null);
  }, []);

  return { messages, isLoading, error, sendMessage, clearHistory };
}
