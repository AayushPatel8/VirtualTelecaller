import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Brain, Sparkles, Bot } from 'lucide-react';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 mix-blend-multiply" />
        </div>
        
        <div className="relative px-4 py-16 sm:px-6 sm:py-24 lg:py-32 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-8">
                <span className="block">Experience the Future of</span>
                <span className="block text-emerald-400">Voice AI Interaction</span>
              </h1>
              <p className="max-w-2xl mx-auto text-xl text-gray-300 mb-12">
                Engage in natural conversations with our advanced AI assistant. Experience seamless voice interaction powered by cutting-edge technology.
              </p>
              <button
                onClick={() => navigate('/chat')}
                className="inline-flex items-center px-8 py-4 rounded-full text-lg font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors duration-300 shadow-lg hover:shadow-xl"
              >
                <Mic className="w-6 h-6 mr-2" />
                Start Conversation
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <Brain className="w-12 h-12 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Advanced AI Processing</h3>
            <p className="text-gray-400">Powered by state-of-the-art language models for natural and intelligent responses.</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <Sparkles className="w-12 h-12 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Real-time Interaction</h3>
            <p className="text-gray-400">Experience fluid conversations with minimal latency and high accuracy.</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <Bot className="w-12 h-12 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Contextual Understanding</h3>
            <p className="text-gray-400">AI that understands context and maintains coherent conversations.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-400">
            © 2025 Voice AI Assistant. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;