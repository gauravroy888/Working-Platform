import React, { useState, useEffect, Suspense, lazy } from "react";
import { HashRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import ChapterShell from "./components/ChapterShell.jsx";

const ChapterDetailView     = lazy(() => import("./views/ChapterDetailView.jsx"));
const QuizView                = lazy(() => import("./views/QuizView.jsx"));
const ChapterExperienceView   = lazy(() => import("./views/ChapterExperienceView.jsx"));
const ShadowLabView           = lazy(() => import("./views/ShadowLabView.jsx"));
const StudyIslandView         = lazy(() => import("./views/StudyIslandView.jsx"));

function Loading() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#090d16", color: "#00f0ff", fontFamily: "system-ui" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "36px", marginBottom: "12px" }}>🌍</div>
        <div style={{ fontWeight: 600, letterSpacing: "0.05em" }}>Loading EdTech Island...</div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<StudyIslandView />} />
          <Route path="/chapter/:chapterId" element={<ChapterDetailView />} />
          <Route path="/experience" element={<ChapterExperienceView />} />
          <Route path="/experience/light-shadows" element={<ChapterExperienceView />} />
          <Route path="/quiz" element={<QuizView />} />
          <Route path="/lab" element={<ShadowLabView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
}
