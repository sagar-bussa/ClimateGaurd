import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  X, 
  Bot, 
  User, 
  CheckCircle2, 
  HelpCircle 
} from 'lucide-react';
import { askClimateAssistant } from '../services/api';

export default function ClimateAssistantModal({ isOpen, onClose, contextData }) {
  if (!isOpen) return null;

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I am ClimateGuard AI Assistant. I provide data-grounded insights based strictly on verified atmospheric data for ${contextData?.location?.name || 'this location'}. Ask me about outdoor safety, risk factors, or pollutant levels.`
    }
  ]);
  const [loading, setLoading] = useState(false);

  const suggestedQuestions = [
    "Is the weather safe for outdoor activities?",
    "Why is the environmental risk at this level?",
    "Which factor is causing the current risk?",
    "How consistent is the sensor data?",
    "Is the air quality acceptable right now?"
  ];

  const handleSend = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || loading) return;

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await askClimateAssistant(text, contextData);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.reply,
        sources: res.sources_cited
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I encountered an issue: ${err.message}. Please try again.`
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl h-[620px] rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">AI Climate Assistant</h3>
              <p className="text-[11px] text-slate-400">
                Data-Grounded Atmospheric Intelligence • Grounded in {contextData?.location?.name}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Suggestion Chips */}
        <div className="p-3 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[10px] text-slate-500 font-bold uppercase shrink-0">Try:</span>
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800/90 hover:bg-slate-750 text-slate-300 border border-slate-700/60 whitespace-nowrap transition"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat History Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
          {messages.map((m, idx) => (
            <div 
              key={idx} 
              className={`flex gap-3 text-xs leading-relaxed ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div 
                className={`p-3.5 rounded-xl max-w-[85%] ${
                  m.role === 'user' 
                    ? 'bg-emerald-600 text-slate-950 font-medium' 
                    : 'bg-slate-950/90 text-slate-200 border border-slate-800'
                }`}
              >
                <div className="whitespace-pre-line">{m.content}</div>
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Ground Truth: {m.sources.join(', ')}</span>
                  </div>
                )}
              </div>
              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
              <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Analyzing verified telemetry data...</span>
            </div>
          )}
        </div>

        {/* Input Box */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about weather safety, risk drivers, or sensor consistency..."
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
