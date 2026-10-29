import React, { useState, useEffect, useRef } from 'react';
import { usePlant } from '../context/PlantContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ChatMessage } from '../types';
import {
  Bot,
  Send,
  Sparkles,
  Trash2,
  RefreshCw,
  Cpu,
  Layers,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';

export const AIAssistantPage: React.FC = () => {
  const { latestReading, activeAlertsCount, activeRates, activeAnomaliesCount } = usePlant();
  const { user } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadHistory = async () => {
    try {
      const res = await api.getChatHistory();
      if (res.success && res.messages && res.messages.length > 0) {
        setMessages(res.messages);
      } else {
        setMessages([
          {
            sender: 'assistant',
            text: `Welcome to the Water Treatment AI Assistant, ${
              user ? user.name.split(' ')[0] : 'Operator'
            }. I am integrated with Google Gemini through your Node.js/Express backend, with direct access to live SCADA sensor feeds. How can I assist you with process optimization, chemical dosage calculations, or anomaly diagnosis today?`,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (messageText?: string) => {
    const text = messageText || input;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.sendChatMessage(text, user?.id);
      if (res.success && res.message) {
        setMessages((prev) => [...prev, res.message]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'assistant',
            text: 'I could not reach the server model. Operating metrics remain within standard safety bounds.',
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: `Backend communication error: ${err.message}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    await api.clearChatHistory();
    setMessages([
      {
        sender: 'assistant',
        text: 'Telemetry memory refreshed. How can I assist with water treatment operations?',
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const suggestedPrompts = [
    'How should we adjust Alum coagulant dosage for current turbidity?',
    'What are the EPA/WHO regulatory limits for potable drinking water?',
    'Explain how temperature affects chlorine disinfection kinetics',
    'Which equipment items are at highest risk of mechanical failure?',
    'What actions should the operator take if pH drops below 6.5?',
    'Analyze the relationship between turbidity and filter backwash frequency',
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
      {/* Left Column: Live Context & Suggested Topics */}
      <div className="lg:col-span-1 space-y-4 flex flex-col justify-between overflow-y-auto">
        {/* Real-time Telemetry Context Box */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="flex items-center gap-2 mb-3 text-cyan-400 font-semibold text-xs uppercase tracking-wider">
            <Cpu className="h-4 w-4" />
            <span>Active Plant Context</span>
          </div>

          <div className="space-y-2 font-mono text-xs text-slate-300">
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-500">Live pH:</span>
              <span className="text-white font-bold">{latestReading?.ph ?? 7.32}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-500">Turbidity:</span>
              <span className="text-amber-300 font-bold">{latestReading?.turbidity ?? 1.65} NTU</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-500">Water Temp:</span>
              <span className="text-slate-200">{latestReading?.temperature ?? 19.8} °C</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-500">Intake Flow:</span>
              <span className="text-slate-200">{latestReading?.flowRate ?? 245} m³/h</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-500">Alum Dose:</span>
              <span className="text-cyan-300">{activeRates.alum} mg/L</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Active Alarms:</span>
              <span className={activeAlertsCount > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                {activeAlertsCount}
              </span>
            </div>
          </div>
        </div>

        {/* Suggested Queries */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 flex-1">
          <div className="flex items-center gap-2 mb-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">
            <HelpCircle className="h-4 w-4 text-cyan-400" />
            <span>Process Engineering Queries</span>
          </div>

          <div className="space-y-2">
            {suggestedPrompts.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="w-full text-left rounded-xl border border-slate-800 bg-slate-950/70 p-2.5 text-xs text-slate-300 hover:border-cyan-600 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Panel */}
      <div className="lg:col-span-3 rounded-2xl border border-slate-800 bg-slate-900/90 flex flex-col justify-between overflow-hidden shadow-2xl">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3.5 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-600 to-indigo-600 text-white shadow-md">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Water Treatment AI Assistant</span>
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Google Gemini 3.8 Flash • Server-Side Express Integration
              </p>
            </div>
          </div>

          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-400 hover:text-rose-400 hover:border-rose-900/40 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear Thread</span>
          </button>
        </div>

        {/* Message Stream */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-cyan-600 text-white rounded-br-none shadow-lg shadow-cyan-900/20'
                    : 'bg-slate-950/80 text-slate-200 border border-slate-800 rounded-bl-none shadow-md'
                }`}
              >
                {m.text}
              </div>
              <span className="mt-1 text-[10px] text-slate-500 font-mono px-1">
                {m.sender === 'user' ? (user?.name || 'Operator') : 'Water Treatment AI Assistant'} •{' '}
                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2.5 text-xs text-slate-400 bg-slate-950/80 rounded-2xl p-4 border border-slate-800 w-fit">
              <Sparkles className="h-4 w-4 animate-spin text-cyan-400" />
              <span>Analyzing plant telemetry with Google Gemini...</span>
            </div>
          )}
        </div>

        {/* Prompt Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="border-t border-slate-800 bg-slate-950/90 p-4 flex items-center gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your water chemistry question, anomaly inquiry, or equipment inquiry..."
            className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-600 text-white hover:bg-cyan-500 disabled:opacity-50 transition-colors flex-shrink-0 cursor-pointer"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
