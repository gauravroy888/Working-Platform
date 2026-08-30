import { useState, useCallback, useRef, useEffect } from "react";

/* ── Strip markdown + emojis before TTS ──────────────────────────────────── */
function cleanForSpeech(raw) {
  if (!raw) return "";
  return raw
    .replace(/\p{Emoji_Presentation}/gu, "")
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, "")
    .replace(/[\u{2600}-\u{27BF}]/gu,   "")
    .replace(/[\u{1F900}-\u{1FAFF}]/gu, "")
    .replace(/```[\s\S]*?```/g, "code block")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*{1,3}([^*\n]+)\*{1,3}/g, "$1")
    .replace(/_{1,3}([^_\n]+)_{1,3}/g,   "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_~`#|\\]/g, "")
    .replace(/\n+/g, ". ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/* ── Indian English voice preference ───────────────────────────────────── */
function pickVoice() {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const vs = window.speechSynthesis.getVoices() || [];
  return (
    vs.find(v => v.lang === "en-IN" && /google/i.test(v.name)) ||
    vs.find(v => v.lang === "en-IN") ||
    vs.find(v => /neerja|heera|ravi/i.test(v.name)) ||
    vs.find(v => /india/i.test(v.name)) ||
    vs.find(v => v.lang && v.lang.startsWith("en")) || null
  );
}

export default function useVoiceIO() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking,  setIsSpeaking ] = useState(false);
  const [isMuted,     setIsMuted    ] = useState(() => {
    try { return localStorage.getItem("aria_muted") === "true"; } catch { return false; }
  });
  const [audioLevels, setAudioLevels] = useState([4, 4, 4, 4, 4]);

  const isMutedRef        = useRef(isMuted);
  isMutedRef.current      = isMuted;

  const recRef            = useRef(null);
  const listeningRef      = useRef(false);
  const audioCtxRef       = useRef(null);
  const analyserRef       = useRef(null);
  const micStreamRef      = useRef(null);
  const animFrameRef      = useRef(null);
  const retryTimerRef     = useRef(null);
  const activeCallbackRef = useRef(null);
  const lastSpokenRef     = useRef("");

  const isSTTSupported = typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
  const isTTSSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      try { localStorage.setItem("aria_muted", String(next)); } catch {}
      if (next && isTTSSupported) window.speechSynthesis?.cancel();
      return next;
    });
  }, [isTTSSupported]);

  /* ── Audio analyser (stop must be declared first for TDZ safety) ── */
  const stopAudioAnalyser = useCallback(() => {
    if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
    }
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch {}
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevels([4, 4, 4, 4, 4]);
  }, []);

  const startAudioAnalyser = useCallback(async () => {
    try {
      if (audioCtxRef.current) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const ana = ctx.createAnalyser();
      ana.fftSize = 32;
      src.connect(ana);
      analyserRef.current = ana;
      const dataArray = new Uint8Array(ana.frequencyBinCount);
      const updateWave = () => {
        if (!analyserRef.current) return;
        ana.getByteFrequencyData(dataArray);
        setAudioLevels([
          Math.max(4, Math.round((dataArray[1] || 0) / 6)),
          Math.max(4, Math.round((dataArray[3] || 0) / 6)),
          Math.max(4, Math.round((dataArray[5] || 0) / 6)),
          Math.max(4, Math.round((dataArray[7] || 0) / 6)),
          Math.max(4, Math.round((dataArray[9] || 0) / 6)),
        ]);
        animFrameRef.current = requestAnimationFrame(updateWave);
      };
      updateWave();
    } catch {
      // Audio analyser is optional — silently ignore
    }
  }, []);

  useEffect(() => {
    if (isTTSSupported && !window.speechSynthesis.getVoices().length) {
      window.speechSynthesis.addEventListener("voiceschanged", () => {}, { once: true });
    }
    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      if (recRef.current) { try { recRef.current.abort(); } catch {} }
      if (isTTSSupported) window.speechSynthesis?.cancel();
      stopAudioAnalyser();
    };
  }, [isTTSSupported, stopAudioAnalyser]);

  /* ── Stop controls (declared before speak/startListening for TDZ safety) ── */
  const stopSpeaking = useCallback(() => {
    if (isTTSSupported) { window.speechSynthesis?.cancel(); setIsSpeaking(false); }
  }, [isTTSSupported]);

  const stopListening = useCallback(() => {
    activeCallbackRef.current = null;
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    listeningRef.current = false;
    if (recRef.current) {
      try { recRef.current.abort(); } catch {}
      recRef.current = null;
    }
    setIsListening(false);
    stopAudioAnalyser();
  }, [stopAudioAnalyser]);

  /* ── TTS: speak(text, onEnd?) ── */
  const speak = useCallback((text, onEnd) => {
    stopListening();
    if (isMutedRef.current) {
      if (onEnd) setTimeout(onEnd, 1200);
      return;
    }
    const clean = cleanForSpeech(text);
    if (!clean || !isTTSSupported) { onEnd?.(); return; }
    lastSpokenRef.current = clean;
    window.speechSynthesis?.cancel();

    const doSpeak = () => {
      const utt = new SpeechSynthesisUtterance(clean);
      utt.lang  = "en-IN";
      utt.rate  = 0.95;
      utt.pitch = 1.05;
      const v = pickVoice(); if (v) utt.voice = v;
      utt.onstart = () => setIsSpeaking(true);
      utt.onend   = () => { setIsSpeaking(false); if (onEnd) setTimeout(onEnd, 600); };
      utt.onerror = () => { setIsSpeaking(false); if (onEnd) setTimeout(onEnd, 600); };
      window.speechSynthesis?.speak(utt);
    };

    if (!window.speechSynthesis?.getVoices().length) {
      window.speechSynthesis?.addEventListener("voiceschanged", doSpeak, { once: true });
    } else { doSpeak(); }
  }, [isTTSSupported, stopListening]);

  /* ── STT: startListening(onFinalResult) ── */
  const startListening = useCallback((onFinalResult) => {
    if (!isSTTSupported) return;
    if (isSpeaking || window.speechSynthesis?.speaking) return;
    if (onFinalResult) activeCallbackRef.current = onFinalResult;
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    if (listeningRef.current && recRef.current) return;
    if (recRef.current) { try { recRef.current.abort(); } catch {} recRef.current = null; }

    const SR  = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous      = false;
    rec.interimResults  = false;
    rec.lang            = "en-IN";
    rec.maxAlternatives = 1;

    rec.onstart  = () => { listeningRef.current = true;  setIsListening(true); startAudioAnalyser(); };
    rec.onend    = () => {
      listeningRef.current = false; setIsListening(false);
      if (activeCallbackRef.current && !window.speechSynthesis?.speaking) {
        retryTimerRef.current = setTimeout(() => {
          if (activeCallbackRef.current && !listeningRef.current) startListening(activeCallbackRef.current);
        }, 400);
      }
    };
    rec.onerror  = (e) => {
      listeningRef.current = false; setIsListening(false);
      console.warn("STT error:", e.error);
      if (activeCallbackRef.current && (e.error === "no-speech" || e.error === "aborted" || e.error === "network")) {
        retryTimerRef.current = setTimeout(() => {
          if (activeCallbackRef.current && !listeningRef.current) startListening(activeCallbackRef.current);
        }, 500);
      }
    };
    rec.onresult = (e) => {
      const final = Array.from(e.results).filter(r => r.isFinal).map(r => r[0].transcript).join(" ").trim();
      if (final) {
        listeningRef.current = false; setIsListening(false);
        const cb = activeCallbackRef.current;
        if (cb) cb(final);
      }
    };

    recRef.current = rec;
    try { rec.start(); }
    catch (err) {
      console.warn("STT start error:", err.message);
      listeningRef.current = false; setIsListening(false);
      if (activeCallbackRef.current) {
        retryTimerRef.current = setTimeout(() => {
          if (activeCallbackRef.current && !listeningRef.current) startListening(activeCallbackRef.current);
        }, 500);
      }
    }
  }, [isSTTSupported, isSpeaking, startAudioAnalyser]);

  return {
    isListening, isSpeaking, isMuted, toggleMute, audioLevels,
    isSTTSupported, isTTSSupported, speak, stopSpeaking, startListening, stopListening
  };
}
