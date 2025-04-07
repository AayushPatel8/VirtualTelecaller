import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import LandingPage from './pages/LandingPage';
import VoiceChat from './pages/VoiceChat';
import ContextPage from './pages/ContextPage';

function App() {
  return (
    <div className="flex">
      <Navigation />
      <main className="flex-1 ml-16">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/chat" element={<VoiceChat />} />
          <Route path="/context" element={<ContextPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;