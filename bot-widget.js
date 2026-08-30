/**
 * bot-widget.js — Aria AI Tutor (Standalone, Vanilla JS)
 * Full feature parity with Student Portal React AITutorWidget & AITutorDrawer:
 *   - Gemini 3.5 Flash Lite + Token SSE Streaming
 *   - Persistent Auto Screen Watch (Ask once, capture on every message)
 *   - Continuous Hands-Free Voice Conversation Loop (Listen -> Think -> Speak -> Listen)
 *   - Indian English TTS Voice (Neerja/Heera/Ravi with clean speech formatting)
 *   - Supabase Cloud Sync + 7-Day Rolling Memory Policy
 *   - Cross-Portal Session Sharing via localStorage + Supabase
 */
(function () {
  "use strict";

  // ── Standalone Bot Init ───────────────────────────────────────────

  var MODEL   = "gemini-1.5-flash";
  var MAX_H   = 12;
  var HINTS   = [
    { label:"What is this?",          value:"What is this thing on my screen? Explain it simply." },
    { label:"Give me a hint",         value:"Give me a small hint without telling me the full answer." },
    { label:"Explain differently",    value:"Can you explain that in a simpler way?" },
    { label:"Check my thinking",      value:"Here is my thinking. Is it on the right track?" },
    { label:"Break it down",          value:"Can you break this into smaller steps for me?" },
  ];

  // ── Gemini Key & URLs ───────────────────────────────────────────────────
  var KEY = "";
  var _FALLBACK_KEY = "";
  function initKey() {
    KEY = localStorage.getItem("aria_gemini_key")
       || (typeof window.ARIA_GEMINI_KEY === "string" ? window.ARIA_GEMINI_KEY : "")
       || _FALLBACK_KEY;
  }

  var SUPABASE_URL = window.SUPABASE_URL || "https://qmyrxvtbzlbnvzxypnus.supabase.co";
  var SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFteXJ4dnRiemxibnZ6eHlwbnVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MjA4OTcsImV4cCI6MjA5NTM5Njg5N30.ABvW_oBzXC2Ffxm5ToLh6t4WmdKPdtg9SyfeAE76iJo";

  // ── Chat History Persistence ───────────────────────────────────────────
  function saveHistoryToStorage() {
    try {
      var saved = (history || []).slice(-20);
      localStorage.setItem("aria_chat_history", JSON.stringify(saved));
    } catch (e) {}
  }

  function restoreHistoryFromStorage() {
    try {
      var raw = localStorage.getItem("aria_chat_history");
      if (!raw) return;
      var list = JSON.parse(raw);
      if (Array.isArray(list) && list.length) {
        var empty = $msgs ? $msgs.querySelector(".ai-drawer__empty") : null;
        if (empty) empty.remove();
        history = [];
        for (var i = 0; i < list.length; i++) {
          var item = list[i];
          var role = item.role === "user" ? "user" : "model";
          var txt = (item.parts && item.parts[0] && item.parts[0].text) || item.text || "";
          if (txt) {
            history.push({ role: role, parts: [{ text: txt }] });
            if ($msgs) addMsg(role, txt, false, false);
          }
        }
        if ($msgs) $msgs.scrollTop = $msgs.scrollHeight;
      }
    } catch (e) {}
  }

  // ── SVG Paths ───────────────────────────────────────────────────────────
  var BOT_DIR = (function() {
    var p = window.location.pathname || "";
    if (p.includes("/study-island")) return "/study-island/assets/bot/";
    return "assets/bot/";
  })();
  var SVG = {
    idle:  BOT_DIR + "bot-idle.svg",
    hover: BOT_DIR + "bot-hover.svg",
    click: BOT_DIR + "bot-click.svg",
    fail:  BOT_DIR + "bot-fail.svg"
  };

  // ── DOM References ──────────────────────────────────────────────────────
  var $w, $svg, $dot, $drawer, $statusSub, $msgs, $watchBanner, $watchBtn, $micBtn, $input, $sendBtn, $muteBtn, $voiceFooter, $voiceLabel;

  // ── State ───────────────────────────────────────────────────────────────
  var history = [];
  var isOpen = false;
  var botState = "idle"; // "idle" | "listening" | "thinking" | "speaking" | "error"
  var isLoading = false;
  var isListening = false;
  var isSpeaking = false;
  var voiceMode = false;
  var isMuted = (function () {
    try { return localStorage.getItem("aria_muted") === "true"; } catch (e) { return false; }
  })();

  // ── Web Audio Real-time Voice Synced Analyser ─────────────────────────────
  var audioCtx = null;
  var analyser = null;
  var micStream = null;
  var animFrameId = null;
  var $waveBars = [];

  function startAudioAnalyser() {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
      navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(function (stream) {
        micStream = stream;
        var AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        audioCtx = new AudioCtx();
        var source = audioCtx.createMediaStreamSource(stream);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.4;
        source.connect(analyser);

        var dataArray = new Uint8Array(analyser.frequencyBinCount);

        function loop() {
          if (!isListening) return;
          analyser.getByteFrequencyData(dataArray);

          var b1 = Math.max(3, Math.min(18, Math.round(3 + (dataArray[2] || 0) / 255 * 15)));
          var b2 = Math.max(3, Math.min(18, Math.round(3 + (dataArray[5] || 0) / 255 * 15)));
          var b3 = Math.max(3, Math.min(18, Math.round(3 + (dataArray[8] || 0) / 255 * 15)));
          var b4 = Math.max(3, Math.min(18, Math.round(3 + (dataArray[12] || 0) / 255 * 15)));
          var b5 = Math.max(3, Math.min(18, Math.round(3 + (dataArray[15] || 0) / 255 * 15)));

          var heights = [b1, b2, b3, b4, b5];
          for (var i = 0; i < $waveBars.length; i++) {
            if ($waveBars[i]) $waveBars[i].style.height = (heights[i] || 4) + "px";
          }
          animFrameId = requestAnimationFrame(loop);
        }
        animFrameId = requestAnimationFrame(loop);
      }).catch(function (e) {
        console.warn("Audio analyser error:", e);
      });
    } catch (e) {}
  }

  function stopAudioAnalyser() {
    if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
    if (micStream) {
      micStream.getTracks().forEach(function (t) { t.stop(); });
      micStream = null;
    }
    if (audioCtx) {
      try { audioCtx.close(); } catch (e) {}
      audioCtx = null;
    }
    for (var i = 0; i < $waveBars.length; i++) {
      if ($waveBars[i]) $waveBars[i].style.height = "4px";
    }
  }

  // ── Persistent Screen Watch Singleton ───────────────────────────────────
  var _stream = null;
  var _video = null;
  var _isWatching = false;

  function startScreenWatch(onReady) {
    if (_isWatching) return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      alert("Screen sharing is not supported in this browser.");
      return;
    }
    navigator.mediaDevices
      .getDisplayMedia({ video: { frameRate: { ideal: 3, max: 5 } }, audio: false, preferCurrentTab: true })
      .then(function (s) {
        _stream = s;
        _video = document.createElement("video");
        _video.srcObject = s;
        _video.muted = true;
        _video.onloadedmetadata = function () {
          _video.play();
          _isWatching = true;
          syncWatchUI();
          if (onReady) onReady();
        };
        s.getVideoTracks()[0].addEventListener("ended", function () {
          _stream = null; _video = null; _isWatching = false;
          syncWatchUI();
        });
      })
      .catch(function (e) {
        console.warn("Screen share cancelled/error:", e.message);
      });
  }

  function stopScreenWatch() {
    if (_stream) {
      _stream.getTracks().forEach(function (t) { t.stop(); });
    }
    _stream = null; _video = null; _isWatching = false;
    syncWatchUI();
  }

  function captureAutoFrame() {
    if (!_isWatching || !_video || !_video.videoWidth) return null;
    try {
      var c = document.createElement("canvas");
      c.width = Math.min(_video.videoWidth, 1280);
      c.height = Math.round(c.width * _video.videoHeight / _video.videoWidth);
      c.getContext("2d").drawImage(_video, 0, 0, c.width, c.height);
      return c.toDataURL("image/jpeg", 0.55).split(",")[1];
    } catch (e) { return null; }
  }

  // ── Context & Memory ────────────────────────────────────────────────────
  function getStudentUser() {
    try {
      return JSON.parse(localStorage.getItem("edtech_user") || localStorage.getItem("edtech_student_user") || "{}");
    } catch (e) { return {}; }
  }

  function getStudentId() {
    var u = getStudentUser();
    return u.id || u.uid || u.email || "guest_student";
  }

  function getCtx() {
    try {
      var u = getStudentUser();
      var b = JSON.parse(localStorage.getItem("edtech_school_branding") || "{}");
      var parts = ["Student: " + (u.name || "Student") + " | Class: " + (u.class_name || "6") + " | School: " + (b.school_name || "EdTech Island")];
      parts.push("Platform: EdTech Island (" + (window.location.pathname || "3D Space") + ")");

      // 1. Current active screen in Study Island navigation
      var activeScreen = document.querySelector(".screen.active, .screen:not(.hidden):not([style*='display: none'])");
      if (activeScreen && activeScreen.id) {
        var screenName = activeScreen.id.replace(/^screen-/, "").toUpperCase();
        parts.push("Current Screen: " + screenName);
      }

      // 2. Iframe simulation or lab overlay currently open
      var overlay = document.getElementById("app-overlay");
      var isOverlayOpen = overlay && !overlay.classList.contains("hidden") && overlay.style.display !== "none";
      if (isOverlayOpen) {
        var iframe = document.getElementById("app-iframe");
        var iframeSrc = iframe ? (iframe.getAttribute("src") || "") : "";
        var labName = iframeSrc.split("?")[0].replace(/\.html$/, "").replace(/_/g, " ");
        parts.push("Interactive Simulation Open: " + (labName || "Lab Module"));
        try {
          if (iframe && iframe.contentDocument) {
            var iDoc = iframe.contentDocument;
            var iH = iDoc.querySelector("h1, h2, .lab-title, .title");
            if (iH && iH.textContent) parts.push("Simulation View: " + iH.textContent.trim().slice(0, 80));
          }
        } catch (e) {}
      }

      // 3. Current active subject, chapter, or curriculum badge
      var badge = document.querySelector(".curriculum-badge, .header-pill");
      if (badge && badge.textContent) parts.push("Curriculum: " + badge.textContent.trim().slice(0, 40));

      var activeSubj = document.querySelector(".subject-card.active, .subject-pill.active");
      if (activeSubj && activeSubj.textContent) parts.push("Subject: " + activeSubj.textContent.trim().slice(0, 50));

      var activeChap = document.querySelector(".chapter-card.active, .chapter-title, #chapter-title, .detail-title");
      if (activeChap && activeChap.textContent) parts.push("Chapter: " + activeChap.textContent.trim().slice(0, 80));

      // 4. Visible headings / active buttons
      var container = activeScreen || document.body;
      var nodes = container.querySelectorAll("h1, h2, h3, .tab-btn.active, button.active, .sub-heading");
      var texts = [];
      var len = 0;
      for (var i = 0; i < nodes.length; i++) {
        if (len > 300) break;
        var t = (nodes[i].textContent || "").replace(/\s+/g, " ").trim();
        if (t.length > 2 && t.length < 80 && !texts.includes(t)) {
          texts.push(t);
          len += t.length;
        }
      }
      if (texts.length) parts.push("Visible Context: " + texts.slice(0, 6).join(" | "));

      return parts.join("\n").slice(0, 480);
    } catch (e) {
      return "EdTech Island - " + document.title;
    }
  }

  function buildSystemPrompt() {
    var u = getStudentUser();
    var b = JSON.parse(localStorage.getItem("edtech_school_branding") || "{}");
    var school = b.school_name || "EdTech Island";
    var name = u.name || "Student";
    var cls = u.class_name || "Class 6";
    var sess = getSessionCtx();

    return "You are Aria, an AI tutor for " + school + ". You are tutoring " + name + " (" + cls + ").\n\n" +
      "CONTEXT:\n" +
      (sess ? sess + "\n" : "") +
      "You receive [Screen context] with every message — use it to give specific, relevant help.\n\n" +
      "RULES (STRICT):\n" +
      "- NO emojis, NO markdown, NO asterisks, NO bullets, NO symbols like *, **, ##, #, -, >, etc.\n" +
      "- Write in plain conversational sentences only, like speaking to a student.\n" +
      "- DO NOT repeat 'Hello " + name + "' or intro greetings on follow-up messages. Greet ONCE on the first message of a conversation, then answer follow-up questions directly without repeating canned intros or names.\n" +
      "- Guide with Socratic hints — help the student think, do not give full answers directly.\n" +
      "- Keep replies under 55 words and vary your wording naturally on every reply.\n" +
      "- Reference what is on screen when relevant.\n" +
      "- End with a short question or encouragement.\n" +
      "- Indian-friendly English tone is fine.";
  }

  function getSessionCtx() {
    try {
      var s = JSON.parse(localStorage.getItem("aria_session") || "{}");
      var y = JSON.parse(localStorage.getItem("aria_yesterday") || "{}");
      var parts = [];
      if (s.summary) parts.push("Today so far: " + s.summary);
      else if (s.topics && s.topics.length) parts.push("Topics today: " + s.topics.join(", ") + ".");
      if (y && y.summary) parts.push("Yesterday (" + y.date + "): " + y.summary);
      return parts.join(" ");
    } catch (e) { return ""; }
  }

  function syncSupabaseSession(s) {
    try {
      var studentId = getStudentId();
      fetch(SUPABASE_URL + "/rest/v1/aria_ai_sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": "Bearer " + SUPABASE_ANON_KEY,
          "Prefer": "resolution=merge-duplicates"
        },
        body: JSON.stringify({
          student_id: studentId,
          session_date: s.date,
          topics: s.topics || [],
          summary: s.summary || "",
          message_count: s.messageCount || 0,
          updated_at: new Date().toISOString()
        })
      }).catch(function () {});
    } catch (e) {}
  }

  function trackSessionTopic(title) {
    try {
      var raw = localStorage.getItem("aria_session");
      var today = new Date().toLocaleDateString("en-CA");
      var s = raw ? JSON.parse(raw) : { date: today, topics: [], summary: "", messageCount: 0 };
      if (s.date !== today) {
        if (s.summary || (s.topics && s.topics.length)) {
          localStorage.setItem("aria_yesterday", JSON.stringify({ date: s.date, summary: s.summary || ("Studied: " + s.topics.join(", ")) }));
        }
        s = { date: today, topics: [], summary: "", messageCount: 0 };
      }
      if (title && !s.topics.includes(title)) s.topics.push(title);
      s.messageCount = (s.messageCount || 0) + 1;
      localStorage.setItem("aria_session", JSON.stringify(s));
      syncSupabaseSession(s);
    } catch (e) {}
  }

  // ── Speech Output (TTS) with Indian Voice ───────────────────────────────
  var cachedVoice = null;
  function getIndianVoice() {
    if (!window.speechSynthesis) return null;
    var voices = window.speechSynthesis.getVoices();
    if (!voices || !voices.length) return null;
    if (cachedVoice) return cachedVoice;
    var v = voices.find(function (x) { return x.lang === "en-IN" && (x.name.includes("Neerja") || x.name.includes("Heera") || x.name.includes("Ravi")); })
         || voices.find(function (x) { return x.lang === "en-IN"; })
         || voices.find(function (x) { return x.lang && x.lang.startsWith("en"); })
         || voices[0];
    cachedVoice = v;
    return v;
  }

  function cleanForSpeech(text) {
    if (!text) return "";
    return text
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu, "")
      .replace(/\*+/g, "")
      .replace(/#+/g, "")
      .replace(/`+/g, "")
      .replace(/_{2,}/g, "")
      .replace(/^[•\-\*]\s+/gm, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function toggleMute() {
    isMuted = !isMuted;
    try { localStorage.setItem("aria_muted", String(isMuted)); } catch (e) {}
    if (isMuted && window.speechSynthesis) window.speechSynthesis.cancel();
    syncMuteUI();
    updateStatusLabel();
  }

  var retryTimer = null;
  var activeCallback = null;

  function startAudioAnalyser() {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;

      var initStream = function (stream) {
        micStream = stream;
        var AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;

        if (!audioCtx || audioCtx.state === "closed") {
          audioCtx = new AudioCtx();
          var source = audioCtx.createMediaStreamSource(micStream);
          analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          analyser.smoothingTimeConstant = 0.4;
          source.connect(analyser);
        } else if (audioCtx.state === "suspended") {
          audioCtx.resume();
        }

        if (!analyser) return;
        var dataArray = new Uint8Array(analyser.frequencyBinCount);

        function loop() {
          if (!isListening) return;
          analyser.getByteFrequencyData(dataArray);

          var b1 = Math.max(3, Math.min(18, Math.round(3 + (dataArray[2] || 0) / 255 * 15)));
          var b2 = Math.max(3, Math.min(18, Math.round(3 + (dataArray[5] || 0) / 255 * 15)));
          var b3 = Math.max(3, Math.min(18, Math.round(3 + (dataArray[8] || 0) / 255 * 15)));
          var b4 = Math.max(3, Math.min(18, Math.round(3 + (dataArray[12] || 0) / 255 * 15)));
          var b5 = Math.max(3, Math.min(18, Math.round(3 + (dataArray[15] || 0) / 255 * 15)));

          var heights = [b1, b2, b3, b4, b5];
          for (var i = 0; i < $waveBars.length; i++) {
            if ($waveBars[i]) $waveBars[i].style.height = (heights[i] || 4) + "px";
          }
          animFrameId = requestAnimationFrame(loop);
        }
        if (animFrameId) cancelAnimationFrame(animFrameId);
        animFrameId = requestAnimationFrame(loop);
      };

      if (micStream && micStream.active) {
        initStream(micStream);
      } else {
        navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(initStream).catch(function (e) {
          console.warn("Audio analyser error:", e);
        });
      }
    } catch (e) {}
  }

  function stopAudioAnalyser() {
    if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
    if (micStream) {
      micStream.getTracks().forEach(function (t) { t.stop(); });
      micStream = null;
    }
    if (audioCtx) {
      try { audioCtx.close(); } catch (e) {}
      audioCtx = null;
    }
    for (var i = 0; i < $waveBars.length; i++) {
      if ($waveBars[i]) $waveBars[i].style.height = "4px";
    }
  }

  function syncMuteUI() {
    if (!$muteBtn) return;
    if (isMuted) {
      $muteBtn.className = "ai-drawer__icon-btn muted";
      $muteBtn.title = "Unmute Aria's voice";
      $muteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>';
    } else {
      $muteBtn.className = "ai-drawer__icon-btn";
      $muteBtn.title = "Mute Aria's voice";
      $muteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>';
    }
  }

  function speak(text, onEnd) {
    // ALWAYS stop STT before starting TTS speech synthesis
    stopListen();

    if (isMuted) {
      if (onEnd) setTimeout(onEnd, 1200);
      return;
    }
    if (!window.speechSynthesis) { if (onEnd) onEnd(); return; }
    try { window.speechSynthesis.cancel(); } catch (e) {}
    var spoken = cleanForSpeech(text);
    if (!spoken) { if (onEnd) onEnd(); return; }
    lastSpokenText = spoken;
    var u = new SpeechSynthesisUtterance(spoken);
    var v = getIndianVoice();
    if (v) u.voice = v;
    u.lang = "en-IN";
    u.rate = 1.0;
    u.pitch = 1.05;
    u.onstart = function () { isSpeaking = true; setBotState("speaking"); updateStatusLabel(); };
    u.onend = function () {
      isSpeaking = false;
      setBotState("idle");
      updateStatusLabel();
      if (onEnd && isOpen && voiceMode) setTimeout(onEnd, 600);
    };
    u.onerror = function () {
      isSpeaking = false;
      setBotState("idle");
      updateStatusLabel();
      if (onEnd && isOpen && voiceMode) setTimeout(onEnd, 600);
    };
    window.speechSynthesis.speak(u);
  }

  function stopSpeaking() {
    if (window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
    isSpeaking = false;
    setBotState("idle");
    updateStatusLabel();
  }

  // ── Speech Recognition (STT) ───────────────────────────────────────────
  function startListen(onResult) {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) return;
    // STT MUST NEVER run if drawer is closed, voice mode is off, or TTS is speaking
    if (!isOpen || !voiceMode || isSpeaking || (window.speechSynthesis && window.speechSynthesis.speaking)) return;

    if (onResult) activeCallback = onResult;
    if (retryTimer) clearTimeout(retryTimer);

    if (isListening && recognition) return;

    if (recognition) {
      try { recognition.abort(); } catch (e) {}
      recognition = null;
    }

    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN";
    recognition.maxAlternatives = 1;

    recognition.onstart = function () {
      if (!isOpen || !voiceMode) { stopListen(); return; }
      isListening = true;
      setBotState("listening");
      startAudioAnalyser();
      updateStatusLabel();
    };

    recognition.onresult = function (e) {
      if (!isOpen || !voiceMode) { stopListen(); return; }
      var transcript = (e.results && e.results[0] && e.results[0][0] && e.results[0][0].transcript) || "";
      var text = transcript.trim();
      if (text) {
        if (isEchoOfLastSpeech(text, lastSpokenText)) {
          console.warn("STT: Discarded self-echoed speaker audio:", text);
          isListening = false;
          setBotState("idle");
          stopAudioAnalyser();
          updateStatusLabel();
          if (isOpen && voiceMode && activeCallback) {
            retryTimer = setTimeout(function () {
              if (isOpen && voiceMode && activeCallback && !isListening) {
                startListen(activeCallback);
              }
            }, 600);
          }
          return;
        }
        isListening = false;
        setBotState("idle");
        stopAudioAnalyser();
        updateStatusLabel();
        var cb = activeCallback;
        if (cb) cb(text);
      }
    };

    recognition.onerror = function (e) {
      console.warn("STT error:", e.error);
      isListening = false;
      setBotState("idle");
      stopAudioAnalyser();
      updateStatusLabel();
      if (isOpen && voiceMode && activeCallback && (e.error === "no-speech" || e.error === "aborted" || e.error === "network")) {
        retryTimer = setTimeout(function () {
          if (isOpen && voiceMode && activeCallback && !isListening) {
            startListen(activeCallback);
          }
        }, 500);
      }
    };

    recognition.onend = function () {
      isListening = false;
      setBotState("idle");
      stopAudioAnalyser();
      updateStatusLabel();
      if (isOpen && voiceMode && activeCallback && !isLoading && !isSpeaking) {
        retryTimer = setTimeout(function () {
          if (isOpen && voiceMode && activeCallback && !isListening) {
            startListen(activeCallback);
          }
        }, 400);
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.warn("STT start error, scheduling retry:", e.message);
      isListening = false;
      setBotState("idle");
      stopAudioAnalyser();
      updateStatusLabel();
      if (isOpen && voiceMode && activeCallback) {
        retryTimer = setTimeout(function () {
          if (isOpen && voiceMode && activeCallback && !isListening) {
            startListen(activeCallback);
          }
        }, 500);
      }
    }
  }

  function stopListen() {
    activeCallback = null;
    if (retryTimer) { clearTimeout(retryTimer); retryTimer = null; }
    if (recognition) {
      try { recognition.abort(); } catch (e) {}
      recognition = null;
    }
    isListening = false;
    setBotState("idle");
    stopAudioAnalyser();
    updateStatusLabel();
  }

  // ── SSE Token Streaming Gemini API Call ─────────────────────────────────
  async function streamChat(text, onToken, onComplete, onError) {
    initKey();
    if (!KEY) {
      if (onError) onError("API key not found. Please log in through the Student Portal first.");
      return;
    }
    trackSessionTopic(document.title);
    var autoFrame = captureAutoFrame();
    var parts = [{ text: "[Screen context: " + getCtx() + "]" }, { text: text }];
    if (autoFrame) {
      parts.push({ inline_data: { mime_type: "image/jpeg", data: autoFrame } });
    }
    history.push({ role: "user", parts: [{ text: text }] });
    if (history.length > MAX_H) history = history.slice(-MAX_H);

    var sysInstruction = buildSystemPrompt();

    var body = JSON.stringify({
      system_instruction: { parts: [{ text: sysInstruction }] },
      contents: history.slice(0, -1).concat([{ role: "user", parts: parts }]),
      generationConfig: { temperature: 0.6, maxOutputTokens: 150, topP: 0.9 }
    });

    var url = "https://generativelanguage.googleapis.com/v1beta/models/" + MODEL + ":streamGenerateContent?alt=sse&key=" + KEY;

    try {
      var response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body
      });
      if (!response.ok) throw new Error("HTTP " + response.status);

      var reader = response.body.getReader();
      var decoder = new TextDecoder();
      var accumulated = "";

      while (true) {
        var { done, value } = await reader.read();
        if (done) break;
        var chunk = decoder.decode(value, { stream: true });
        var lines = chunk.split("\n");
        for (var line of lines) {
          if (line.startsWith("data: ")) {
            var jsonStr = line.slice(6).trim();
            if (!jsonStr || jsonStr === "[DONE]") continue;
            try {
              var parsed = JSON.parse(jsonStr);
              var token = parsed?.candidates?.[0]?.content?.parts?.[0]?.text || "";
              if (token) {
                accumulated += token;
                if (onToken) onToken(accumulated);
              }
            } catch (e) {}
          }
        }
      }

      history.push({ role: "model", parts: [{ text: accumulated }] });
      if (onComplete) onComplete(accumulated, !!autoFrame);
    } catch (err) {
      if (onError) onError(err.message || "Connection error");
    }
  }

  // ── DOM References ──────────────────────────────────────────────────────
  var $w, $svg, $dot, $drawer, $msgs, $input, $watchBtn, $watchBanner, $micBtn, $sendBtn, $statusSub, $voiceFooter;

  function setBotState(s) {
    botState = s;
    if ($dot) {
      $dot.className = "state-dot state-dot--" + s;
    }
    if ($svg && !isOpen) {
      $svg.src = (s === "thinking" || s === "listening") ? SVG.click : (s === "error" ? SVG.fail : SVG.idle);
    }
  }

  function updateStatusLabel() {
    if (!$statusSub) return;
    var u = getStudentUser();
    var name = u.name || "Student";
    var text = voiceMode && isListening ? "Listening — speak now"
      : voiceMode && isSpeaking  ? "Speaking — will listen when done"
      : voiceMode && isLoading   ? "Thinking"
      : isListening              ? "Listening"
      : isLoading                ? "Thinking"
      : isSpeaking               ? "Speaking"
      : "Hi " + name + "! Ask me anything.";
    $statusSub.textContent = text;

    if ($voiceFooter) {
      $voiceFooter.style.display = voiceMode ? "block" : "none";
      if (voiceMode) {
        $voiceFooter.textContent = isListening ? "Listening — speak now"
          : isSpeaking ? "Speaking — will auto-listen when done"
          : isLoading ? "Thinking..."
          : "Voice mode on — I will listen automatically after each reply";
        $voiceFooter.style.color = isListening ? "#60a5fa" : (isSpeaking ? "#a78bfa" : "#64748b");
      }
    }
  }

  function syncWatchUI() {
    if ($watchBtn) {
      $watchBtn.style.color = _isWatching ? "#10B981" : "";
      $watchBtn.style.borderColor = _isWatching ? "rgba(16,185,129,0.5)" : "";
      $watchBtn.style.background = _isWatching ? "rgba(16,185,129,0.1)" : "";
      $watchBtn.innerHTML = _isWatching
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>';
      $watchBtn.title = _isWatching ? "Stop watching screen" : "Let Aria watch your screen automatically";
    }
    if ($watchBanner) $watchBanner.style.display = _isWatching ? "flex" : "none";
  }

  function addMsg(role, text, isStreaming, hasAutoScreen) {
    var empty = $msgs.querySelector(".ai-drawer__empty");
    if (empty) empty.remove();

    var row = document.createElement("div");
    row.className = "ai-drawer__msg ai-drawer__msg--" + role;

    if (role === "model") {
      var av = document.createElement("span");
      av.className = "ai-drawer__avatar";
      av.textContent = "🤖";
      row.appendChild(av);
    }

    var bub = document.createElement("div");
    bub.className = "ai-drawer__bubble" + (isStreaming ? " streaming" : "");

    if (hasAutoScreen) {
      var screenTag = document.createElement("div");
      screenTag.style.cssText = "font-size:0.68rem;color:#10B981;margin-bottom:4px;display:flex;align-items:center;gap:4px;";
      screenTag.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg> Aria saw your screen';
      bub.appendChild(screenTag);
    }

    var textNode = document.createElement("span");
    textNode.className = "bubble-text";
    textNode.textContent = text || (isStreaming ? "" : "...");
    bub.appendChild(textNode);

    if (role === "model" && !isStreaming && text) {
      var replayBtn = document.createElement("button");
      replayBtn.className = "ai-drawer__replay";
      replayBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg> play';
      replayBtn.onclick = function () { speak(text); };
      bub.appendChild(replayBtn);
    }

    row.appendChild(bub);
    $msgs.appendChild(row);
    $msgs.scrollTop = $msgs.scrollHeight;
    return { row: row, bub: bub, textNode: textNode };
  }

  function addThinking() {
    var row = document.createElement("div");
    row.className = "ai-drawer__msg ai-drawer__msg--model";
    row.id = "aria-thinking";
    var av = document.createElement("span");
    av.className = "ai-drawer__avatar";
    av.textContent = "🤖";
    row.appendChild(av);
    var bub = document.createElement("div");
    bub.className = "ai-drawer__bubble ai-drawer__bubble--thinking";
    for (var i = 0; i < 3; i++) {
      var d = document.createElement("span");
      d.className = "thinking-dot";
      bub.appendChild(d);
    }
    row.appendChild(bub);
    $msgs.appendChild(row);
    $msgs.scrollTop = $msgs.scrollHeight;
  }

  function removeThinking() {
    var t = document.getElementById("aria-thinking");
    if (t) t.remove();
  }

  function showEmpty() {
    var e = document.createElement("div");
    e.className = "ai-drawer__empty";
    e.innerHTML = '<div class="ai-drawer__empty-icon">🎓</div><p>I am <strong>Aria</strong>, your AI tutor.<br/>Ask me anything about what you are studying!</p><p style="font-size:0.78rem;opacity:0.55;">Press <strong>Watch Screen</strong> once and I will automatically see your screen on every question. Press the mic for hands-free voice chat.</p>';
    $msgs.appendChild(e);
  }

  function afterSpeakLoop() {
    if (!voiceMode) return;
    setTimeout(function () {
      if (voiceMode) {
        startListen(function (voiceText) { doSend(voiceText); });
      }
    }, 500);
  }

  function doSend(textOverride) {
    var text = (textOverride || ($input ? $input.value : "") || "").trim();
    if (!text || isLoading) return;
    if ($input) $input.value = "";

    var hadScreen = _isWatching;
    addMsg("user", text, false, hadScreen);

    isLoading = true;
    setBotState("thinking");
    updateStatusLabel();
    addThinking();

    var streamMsg = null;

    streamChat(
      text,
      function onToken(accumulated) {
        removeThinking();
        if (!streamMsg) {
          streamMsg = addMsg("model", accumulated, true, false);
        } else {
          streamMsg.textNode.textContent = accumulated;
          $msgs.scrollTop = $msgs.scrollHeight;
        }
      },
      function onComplete(fullReply, autoSawScreen) {
        removeThinking();
        isLoading = false;
        setBotState("idle");
        updateStatusLabel();

        if (streamMsg) {
          streamMsg.bub.classList.remove("streaming");
          streamMsg.textNode.textContent = fullReply;
          var replayBtn = document.createElement("button");
          replayBtn.className = "ai-drawer__replay";
          replayBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg> play';
          replayBtn.onclick = function () { speak(fullReply); };
          streamMsg.bub.appendChild(replayBtn);
        } else {
          addMsg("model", fullReply, false, false);
        }

        saveHistoryToStorage();
        speak(fullReply, voiceMode ? afterSpeakLoop : undefined);
      },
      function onError(err) {
        removeThinking();
        isLoading = false;
        setBotState("error");
        updateStatusLabel();
        addMsg("model", "⚠️ " + err, false, false);
        setTimeout(function () { setBotState("idle"); updateStatusLabel(); }, 3000);
      }
    );
  }

  function toggleVoiceMode() {
    if (voiceMode) {
      voiceMode = false;
      stopListen();
      stopSpeaking();
    } else {
      voiceMode = true;
      startListen(function (voiceText) { doSend(voiceText); });
    }
    syncVoiceUI();
    updateStatusLabel();
  }

  function syncVoiceUI() {
    if (!$micBtn) return;
    if (voiceMode) {
      $micBtn.className = "ai-drawer__mic-btn active-voice";
      $micBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>';
      $micBtn.title = "Stop voice mode";
    } else {
      $micBtn.className = "ai-drawer__mic-btn";
      $micBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>';
      $micBtn.title = "Start hands-free voice conversation";
    }
  }

  function updateStatusLabel() {
    if (!$statusSub) return;
    var u = getStudentUser();
    var name = u.name || "Student";
    var text = voiceMode && isListening ? "Listening — speak now"
      : voiceMode && isSpeaking  ? (isMuted ? "Replying silently..." : "Speaking — will listen when done")
      : voiceMode && isLoading   ? "Thinking"
      : isListening              ? "Listening"
      : isLoading                ? "Thinking"
      : isSpeaking               ? (isMuted ? "Replying..." : "Speaking")
      : "Hi " + name + "! Ask me anything.";
    $statusSub.textContent = text;

    if ($voiceFooter) {
      $voiceFooter.style.display = voiceMode ? "flex" : "none";
      if (voiceMode && $voiceLabel) {
        $voiceLabel.textContent = isListening ? "Listening — speak now"
          : isSpeaking ? (isMuted ? "Replying silently..." : "Speaking — will auto-listen when done")
          : isLoading ? "Thinking..."
          : "Voice mode on — I will listen automatically after each reply";
        $voiceLabel.style.color = isListening ? "#ef4444" : (isSpeaking ? "#a78bfa" : "#94a3b8");

        for (var i = 0; i < $waveBars.length; i++) {
          if ($waveBars[i]) {
            if (isSpeaking) $waveBars[i].classList.add("speaking");
            else $waveBars[i].classList.remove("speaking");
          }
        }
      }
    }
  }

  function openDrawer() {
    isOpen = true;
    $w.classList.add("open");
    $drawer.classList.add("ai-drawer--open");
    if ($svg) $svg.src = SVG.hover;
    setTimeout(function () { if ($input) $input.focus(); }, 320);
  }

  function closeDrawer() {
    isOpen = false;
    $w.classList.remove("open");
    $drawer.classList.remove("ai-drawer--open");
    if ($svg) $svg.src = botState === "thinking" ? SVG.click : SVG.idle;
    stopSpeaking();
    if (voiceMode) toggleVoiceMode();
  }

  // ── Build Widget & Drawer DOM ───────────────────────────────────────────
  function build() {
    if (!document.body) {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", build);
      } else {
        setTimeout(build, 100);
      }
      return;
    }

    // Destroy any stale bot DOM from a previous load
    var stale = document.querySelectorAll(".ai-tutor-widget, .ai-drawer");
    stale.forEach(function (el) { el.remove(); });

    // 1. Floating Widget Button
    $w = document.createElement("div");
    $w.className = "ai-tutor-widget aria-widget";

    $svg = document.createElement("img");
    $svg.src = SVG.idle;
    $svg.className = "bot-svg aria-svg";
    $svg.alt = "Aria";
    $svg.onerror = function () {
      if (!$svg._retried) {
        $svg._retried = true;
        $svg.src = "/study-island/assets/bot/bot-idle.svg";
      }
    };

    $dot = document.createElement("span");
    $dot.className = "state-dot state-dot--idle aria-dot idle";

    var tip = document.createElement("div");
    tip.className = "widget-tooltip aria-tip";
    tip.textContent = "✨ Ask Aria — AI Tutor";

    $w.appendChild($svg);
    $w.appendChild($dot);
    $w.appendChild(tip);

    $w.addEventListener("mouseenter", function () { if (!isOpen && $svg) $svg.src = SVG.hover; });
    $w.addEventListener("mouseleave", function () { if (!isOpen && $svg) $svg.src = botState === "thinking" ? SVG.click : SVG.idle; });
    $w.addEventListener("click", function () { isOpen ? closeDrawer() : openDrawer(); });

    // 2. Chat Drawer — hidden by default (no .ai-drawer--open class = not displayed)
    $drawer = document.createElement("div");
    $drawer.className = "ai-drawer aria-drawer";

    // Header
    var hdr = document.createElement("div");
    hdr.className = "ai-drawer__header";

    var titleBox = document.createElement("div");
    titleBox.className = "ai-drawer__title";
    var sdot = document.createElement("span");
    sdot.className = "ai-drawer__sdot";
    titleBox.appendChild(sdot);

    var infoBox = document.createElement("div");
    var nameRow = document.createElement("div");
    nameRow.className = "ai-drawer__name";
    nameRow.textContent = "Aria — AI Tutor";
    infoBox.appendChild(nameRow);

    $statusSub = document.createElement("div");
    $statusSub.className = "ai-drawer__sub";
    infoBox.appendChild($statusSub);
    titleBox.appendChild(infoBox);
    hdr.appendChild(titleBox);

    var actions = document.createElement("div");
    actions.className = "ai-drawer__hdr-actions";

    $muteBtn = document.createElement("button");
    $muteBtn.className = "ai-drawer__icon-btn" + (isMuted ? " muted" : "");
    $muteBtn.onclick = function (e) {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      toggleMute();
    };
    syncMuteUI();

    var trashBtn = document.createElement("button");
    trashBtn.className = "ai-drawer__icon-btn";
    trashBtn.title = "Clear conversation";
    trashBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
    trashBtn.onclick = function (e) {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      history = [];
      try { localStorage.removeItem("aria_chat_history"); } catch (ex) {}
      while ($msgs.firstChild) $msgs.removeChild($msgs.firstChild);
      showEmpty();
    };

    var closeBtn = document.createElement("button");
    closeBtn.className = "ai-drawer__icon-btn";
    closeBtn.title = "Close";
    closeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    closeBtn.onclick = function (e) {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      closeDrawer();
    };

    actions.appendChild($muteBtn);
    actions.appendChild(trashBtn);
    actions.appendChild(closeBtn);
    hdr.appendChild(actions);
    $drawer.appendChild(hdr);

    // Messages Area
    $msgs = document.createElement("div");
    $msgs.className = "ai-drawer__msgs";
    showEmpty();
    restoreHistoryFromStorage();
    $drawer.appendChild($msgs);

    // Hint Chips
    var hintsBox = document.createElement("div");
    hintsBox.className = "ai-drawer__hints";
    HINTS.forEach(function (h) {
      var chip = document.createElement("button");
      chip.className = "ai-drawer__chip";
      chip.textContent = h.label;
      chip.onclick = function () { doSend(h.value); };
      hintsBox.appendChild(chip);
    });
    $drawer.appendChild(hintsBox);

    // Watch Screen Banner
    $watchBanner = document.createElement("div");
    $watchBanner.style.cssText = "display:none;padding:7px 14px;align-items:center;gap:8px;background:rgba(16,185,129,0.07);border-top:1px solid rgba(16,185,129,0.2);";
    $watchBanner.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg><span style="font-size:0.72rem;color:#10B981;flex:1;font-weight:600;">Aria sees your screen on every message</span>';
    var stopBtn = document.createElement("button");
    stopBtn.textContent = "Stop";
    stopBtn.style.cssText = "background:none;color:#64748b;cursor:pointer;font-size:0.7rem;padding:2px 6px;border:1px solid rgba(100,116,139,0.3);border-radius:6px;";
    stopBtn.onclick = stopScreenWatch;
    $watchBanner.appendChild(stopBtn);
    $drawer.appendChild($watchBanner);

    // Input Row
    var inputRow = document.createElement("div");
    inputRow.className = "ai-drawer__input-area";

    // Watch Button
    $watchBtn = document.createElement("button");
    $watchBtn.className = "ai-drawer__mic-btn";
    $watchBtn.title = "Let Aria watch your screen automatically (ask once, capture on every message)";
    $watchBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>';
    $watchBtn.onclick = function () { _isWatching ? stopScreenWatch() : startScreenWatch(); };
    inputRow.appendChild($watchBtn);

    // Voice Mode Button
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      $micBtn = document.createElement("button");
      $micBtn.className = "ai-drawer__mic-btn";
      $micBtn.title = "Start hands-free voice conversation";
      $micBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>';
      $micBtn.onclick = toggleVoiceMode;
      inputRow.appendChild($micBtn);
    }

    // Textarea
    $input = document.createElement("textarea");
    $input.className = "ai-drawer__input";
    $input.placeholder = "Ask anything about your studies...";
    $input.rows = 1;
    $input.onkeydown = function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        doSend();
      }
    };
    inputRow.appendChild($input);

    // Send Button
    $sendBtn = document.createElement("button");
    $sendBtn.className = "ai-drawer__send-btn";
    $sendBtn.title = "Send";
    $sendBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
    $sendBtn.onclick = function () { doSend(); };
    inputRow.appendChild($sendBtn);
    $drawer.appendChild(inputRow);

    // Voice Status Footer with Real-time Waveform
    $voiceFooter = document.createElement("div");
    $voiceFooter.className = "ai-drawer__voice-footer";
    $voiceFooter.style.display = "none";

    var waveContainer = document.createElement("div");
    waveContainer.className = "ai-drawer__waveform";
    $waveBars = [];
    for (var w = 0; w < 5; w++) {
      var bar = document.createElement("span");
      bar.className = "ai-drawer__wave-bar";
      waveContainer.appendChild(bar);
      $waveBars.push(bar);
    }
    $voiceFooter.appendChild(waveContainer);

    $voiceLabel = document.createElement("span");
    $voiceLabel.className = "ai-drawer__voice-label";
    $voiceFooter.appendChild($voiceLabel);

    $drawer.appendChild($voiceFooter);

    document.body.appendChild($w);
    document.body.appendChild($drawer);

    updateStatusLabel();
  }

  // ── Init ────────────────────────────────────────────────────────────────
  function init() {
    initKey();
    build();
    if (window.speechSynthesis && !window.speechSynthesis.getVoices().length) {
      window.speechSynthesis.addEventListener("voiceschanged", function () { getIndianVoice(); }, { once: true });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

})();
