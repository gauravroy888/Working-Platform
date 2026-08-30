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

  const isMutedRef      = useRef(isMuted);
  isMutedRef.current    = isMuted;

  const recRef          = useRef(null);
  const listeningRef    = useRef(false);
  const audioCtxRef     = useRef(null);
  const analyserRef     = useRef(null);
  const micStreamRef    = useRef(null);
  const animFrameRef    = useRef(null);
  const retryTimerRef   = useRef(null);
  const activeCallbackRef = useRef(null);

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
        const l1 = Math.max(4, Math.round((dataArray[1] || 0) / 6));
        const l2 = Math.max(4, Math.round((dataArray[3] || 0) / 6));
        const l3 = Math.max(4, Math.round((dataArray[5] || 0) / 6));
        const l4 = Math.max(4, Math.round((dataArray[7] || 0) / 6));
        const l5 = Math.max(4, Math.round((dataArray[9] || 0) / 6));
        setAudioLevels([l1, l2, l3, l4, l5]);
        animFrameRef.current = requestAnimationFrame(updateWave);
      };
      updateWave();
    } catch {
      // Audio analyser optional fallback
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

  const lastSpokenRef = useRef("");

  /* ── Detect if input is echo of Aria's own speech ── */
  const isEchoOfLastSpeech = (input, lastSpeech) => {
    if (!input || !lastSpeech) return false;
    const inWords = input.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(/\s+/).filter(w => w.length > 2);
    if (inWords.length < 3) return false;
    const speechWords = new Set(lastSpeech.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(/\s+/));
    let matches = 0;
    for (const w of inWords) {
      if (speechWords.has(w)) matches++;
    }
    return (matches / inWords.length) > 0.5;
  };

  /* ── Stop controls (must be declared before speak/startListening for TDZ safety) ── */
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
    // ALWAYS stop STT before starting TTS speech synthesis
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
      utt.lang    = "en-IN";
      utt.rate    = 0.95;
      utt.pitch   = 1.05;
      const v = pickVoice(); if (v) utt.voice = v;
      utt.onstart = () => setIsSpeaking(true);
      utt.onend   = () => {
        setIsSpeaking(false);
        // Wait 600ms acoustic dampening buffer after speech ends to prevent speaker echo triggering mic
        if (onEnd) setTimeout(onEnd, 600);
      };
      utt.onerror = () => {
        setIsSpeaking(false);
        if (onEnd) setTimeout(onEnd, 600);
      };
      window.speechSynthesis?.speak(utt);
    };

    if (!window.speechSynthesis?.getVoices().length) {
      window.speechSynthesis?.addEventListener("voiceschanged", doSpeak, { once: true });
    } else { doSpeak(); }
  }, [isTTSSupported, stopListening]);

  /* ── Resilient STT ── */
  const startListening = useCallback((onFinalResult) => {
    if (!isSTTSupported) return;
    // STT MUST NEVER run while TTS is actively speaking
    if (isSpeaking || window.speechSynthesis?.speaking) return;

    if (onFinalResult) activeCallbackRef.current = onFinalResult;

    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);

    // If currently listening, no need to re-start
    if (listeningRef.current && recRef.current) return;

    if (recRef.current) {
      try { recRef.current.abort(); } catch {}
      recRef.current = null;
    }

    const SR  = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous      = false;
    rec.interimResults  = false;
    rec.lang            = "en-IN";
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      listeningRef.current = true;
      setIsListening(true);
      startAudioAnalyser();
    };

    rec.onend = () => {
      listeningRef.current = false;
      setIsListening(false);
      // If we are supposed to be active and ended without result (e.g. timeout), auto-retry
      if (activeCallbackRef.current) {
        retryTimerRef.current = setTimeout(() => {
          if (activeCallbackRef.current && !listeningRef.current) {
            startListening(activeCallbackRef.current);
          }
        }, 400);
      }
    };

    rec.onerror = (e) => {
      listeningRef.current = false;
      setIsListening(false);
      console.warn("STT error:", e.error);
      // Auto-recover from non-fatal errors (no-speech, network, aborted)
      if (activeCallbackRef.current && (e.error === "no-speech" || e.error === "aborted" || e.error === "network")) {
        retryTimerRef.current = setTimeout(() => {
          if (activeCallbackRef.current && !listeningRef.current) {
            startListening(activeCallbackRef.current);
          }
        }, 500);
      }
    };

    rec.onresult = (e) => {
      const final = Array.from(e.results).filter(r => r.isFinal).map(r => r[0].transcript).join(" ").trim();
      if (final) {
        if (isEchoOfLastSpeech(final, lastSpokenRef.current)) {
          console.warn("STT: Discarded self-echoed speaker audio:", final);
          listeningRef.current = false;
          setIsListening(false);
          if (activeCallbackRef.current) {
            retryTimerRef.current = setTimeout(() => {
              if (activeCallbackRef.current && !listeningRef.current) {
                startListening(activeCallbackRef.current);
              }
            }, 600);
          }
          return;
        }
        listeningRef.current = false;
        setIsListening(false);
        const cb = activeCallbackRef.current;
        if (cb) cb(final);
      }
    };

    recRef.current = rec;
    try {
      rec.start();
    } catch (err) {
      console.warn("STT start error, scheduling retry:", err.message);
      listeningRef.current = false;
      setIsListening(false);
      if (activeCallbackRef.current) {
        retryTimerRef.current = setTimeout(() => {
          if (activeCallbackRef.current && !listeningRef.current) {
            startListening(activeCallbackRef.current);
          }
        }, 500);
      }
    }
  }, [isSTTSupported, startAudioAnalyser]);

  return {
    isListening, isSpeaking, isMuted, toggleMute, audioLevels,
    isSTTSupported, isTTSSupported, speak, stopSpeaking, startListening, stopListening
  };
}
