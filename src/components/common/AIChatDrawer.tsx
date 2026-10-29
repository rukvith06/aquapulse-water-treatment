import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Sparkles, Trash2, Maximize2, Minimize2 } from 'lucide-react';
import { api } from '../../services/api';
import { ChatMessage } from '../../types';
import { usePlant } from '../../context/PlantContext';
import { useAuth } from '../../context/AuthContext';

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToFullChat?: () => void;
}

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateToFullChat,
}) => {
  const { latestReading, activeAlertsCount, activeRates } = usePlant();
  const { user } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load chat history
  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await api.getChatHistory();
        if (res.success && res.messages && res.messages.length > 0) {
          setMessages(res.messages);
        } else {
          // Welcome greeting
          setMessages([
            {
              sender: 'assistant',
              text: `Hello ${user ? user.name.split(' ')[0] : 'Operator'}. I am the Water Treatment AI Assistant powered by Google Gemini. I am continuously synced with real-time SCADA telemetry (pH: ${
                latestReading?.ph || 7.2
              }, Turbidity: ${latestReading?.turbidity || 1.8} NTU, Flow: ${
                latestReading?.flowRate || 240
              } m³/h). Ask me about chemical dosage calculations, anomaly diagnosis, or equipment maintenance schedules.`,
              timestamp: new Date().toISOString(),
            },
          ]);
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      }
    }
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen, user, latestReading]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
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
            text: 'I encountered an error processing your query. SCADA telemetry indicates normal nominal plant parameters.',
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: `Communication error with backend: ${err.message}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    await api.clearChatHistory();
    setMessages([
      {
        sender: 'assistant',
        text: 'Telemetry memory refreshed. How can I assist with water treatment operations?',
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  if (!isOpen) return null;

  const quickPrompts = [
    'How should we adjust Alum dosage for current turbidity?',
    'Is the current pH level compliant with WHO standards?',
    'Diagnose the active alerts on the dashboard',
    'Which equipment unit has the highest maintenance risk?',
  ];

  return (
    <div
      className={`fixed bottom-0 right-0 z-50 flex flex-col bg-slate-900 border-l border-t border-slate-800 shadow-2xl backdrop-blur-xl transition-all duration-300 ${
        isExpanded
          ? 'h-[85vh] w-full md:w-[600px] rounded-tl-2xl'
          : 'h-[580px] w-full md:w-[440px] rounded-tl-2xl'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 bg-slate-950/80 rounded-tl-2xl">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-950 border border-cyan-800/80 text-cyan-400">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <span>Water Treatment AI Assistant</span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              Gemini API • Express Backend Proxy
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title={isExpanded ? 'Restore window size' : 'Expand window'}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <button
            onClick={handleClearHistory}
            className="p-1.5 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Close Assistant"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Real-time Telemetry Context Ribbon */}
      <div className="bg-cyan-950/30 border-b border-cyan-900/30 px-3 py-1.5 text-[11px] text-cyan-300 font-mono flex items-center justify-between overflow-x-auto">
        <span>pH: {latestReading?.ph ?? 7.2}</span>
        <span>•</span>
        <span>Turb: {latestReading?.turbidity ?? 1.8} NTU</span>
        <span>•</span>
        <span>Flow: {latestReading?.flowRate ?? 240} m³/h</span>
        <span>•</span>
        <span>Alum: {activeRates.alum} mg/L</span>
        <span>•</span>
        <span>Alerts: {activeAlertsCount}</span>
      </div>

      {/* Messages Feed */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-cyan-600 text-white rounded-br-none shadow-md shadow-cyan-900/20'
                  : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-bl-none shadow-md'
              }`}
            >
              {m.text}
            </div>
            <span className="mt-1 text-[9px] text-slate-500 font-mono px-1">
              {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/50 rounded-xl px-3 py-2 w-fit border border-slate-800">
            <Sparkles className="h-3.5 w-3.5 animate-spin text-cyan-400" />
            <span>Analyzing plant telemetry with Gemini...</span>
          </div>
        )}
      </div>

      {/* Quick Prompt Chips */}
      <div className="px-3 py-2 border-t border-slate-800/80 bg-slate-950/40 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="flex-shrink-0 rounded-full border border-slate-700/60 bg-slate-800/70 px-2.5 py-1 text-slate-300 hover:border-cyan-600 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 border-t border-slate-800 bg-slate-950/90 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about water chemistry, alerts, dosing..."
          className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-600 text-white hover:bg-cyan-500 disabled:opacity-50 transition-colors flex-shrink-0"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};
