import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Mic, Info, Settings, FileText } from 'lucide-react';

function Navigation() {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="fixed top-0 left-0 h-screen w-16 bg-gray-900 border-r border-gray-800 flex flex-col items-center py-8 z-50">
      <div className="flex flex-col items-center space-y-8">
        <Link
          to="/"
          className={`p-3 rounded-xl transition-all duration-200 group ${
            isActive('/') ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:bg-gray-800'
          }`}
          title="Home"
        >
          <Home className="w-6 h-6" />
        </Link>
        
        <Link
          to="/chat"
          className={`p-3 rounded-xl transition-all duration-200 group ${
            isActive('/chat') ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:bg-gray-800'
          }`}
          title="Voice Chat"
        >
          <Mic className="w-6 h-6" />
        </Link>

        <Link
          to="/context"
          className={`p-3 rounded-xl transition-all duration-200 group ${
            isActive('/context') ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:bg-gray-800'
          }`}
          title="Context"
        >
          <FileText className="w-6 h-6" />
        </Link>
        
        <Link
          to="/about"
          className={`p-3 rounded-xl transition-all duration-200 group ${
            isActive('/about') ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:bg-gray-800'
          }`}
          title="About"
        >
          <Info className="w-6 h-6" />
        </Link>
        
        <Link
          to="/settings"
          className={`p-3 rounded-xl transition-all duration-200 group ${
            isActive('/settings') ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:bg-gray-800'
          }`}
          title="Settings"
        >
          <Settings className="w-6 h-6" />
        </Link>
      </div>
    </nav>
  );
}

export default Navigation;