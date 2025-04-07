import React, { useState } from 'react';
import { Save, Sparkles } from 'lucide-react';
import axios from 'axios';

function ContextPage() {
  const [context, setContext] = useState('');
  const [role, setRole] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [enhanceWithAI, setEnhanceWithAI] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: ''
  });

  const handleSave = async () => {
    if (enhanceWithAI && !role.trim()) {
      setSaveStatus({
        type: 'error',
        message: 'Please enter a role before saving with AI enhancement'
      });
      return;
    }
    
    if (!enhanceWithAI && !context.trim()) {
      setSaveStatus({
        type: 'error',
        message: 'Please enter some context before saving'
      });
      return;
    }

    setIsSaving(true);
    setSaveStatus({ type: null, message: '' });

    try {
      const response = await axios.post('http://127.0.0.1:5000/save-context', {
        context: context,
        enhanceWithAI: enhanceWithAI,
        role: role
      });
      
      setSaveStatus({
        type: 'success',
        message: 'Context saved successfully!'
      });
      
      // Optional: Clear the context after successful save
      // setContext('');
    } catch (error) {
      setSaveStatus({
        type: 'error',
        message: 'Failed to save context. Please try again.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-white mb-2">Context Management</h1>
          <p className="text-gray-400 mb-8">
            Add or update the context information that the AI assistant will use during conversations.
          </p>

          <div className="space-y-6">
            <div className="flex items-center justify-end mb-4">
              <button
                onClick={() => setEnhanceWithAI(!enhanceWithAI)}
                className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 ${
                  enhanceWithAI 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                <Sparkles className={`w-4 h-4 mr-2 ${
                  enhanceWithAI ? 'animate-pulse' : ''
                }`} />
                Enhance with AI
              </button>
            </div>
            
            {enhanceWithAI && (
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-2">
                  Telecaller Role
                </label>
                <input
                  id="role"
                  type="text"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., McDonald's seller, Policeman, Customer Care taker"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>
            )}

            <div>
              <label htmlFor="context" className="block text-sm font-medium text-gray-300 mb-2">
                Context Information
              </label>
              <textarea
                id="context"
                rows={12}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter the context information here..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                disabled={enhanceWithAI}
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`flex items-center px-6 py-3 rounded-lg text-white transition-all duration-200 ${
                  isSaving
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-600'
                }`}
              >
                <Save className="w-5 h-5 mr-2" />
                {isSaving ? 'Saving...' : 'Save Context'}
              </button>

              {saveStatus.type && (
                <div
                  className={`px-4 py-2 rounded-lg ${
                    saveStatus.type === 'success'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-red-500/20 text-red-300'
                  }`}
                >
                  {saveStatus.message}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-4">Tips for Writing Context</h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 mt-2 mr-3 bg-emerald-500 rounded-full"></span>
              Be clear and concise in your descriptions
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 mt-2 mr-3 bg-emerald-500 rounded-full"></span>
              Include relevant keywords and phrases
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 mt-2 mr-3 bg-emerald-500 rounded-full"></span>
              Structure information logically
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 mt-2 mr-3 bg-emerald-500 rounded-full"></span>
              Update regularly to maintain accuracy
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ContextPage;