import React, { useState } from 'react';
import { X, Send, Bot, User, Cpu, Sparkles, Terminal } from 'lucide-react';
import { CloudIncident } from '../types';

interface AgentChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIncident?: CloudIncident;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
}

export const AgentChatDrawer: React.FC<AgentChatDrawerProps> = ({
  isOpen,
  onClose,
  selectedIncident,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'agent',
      text: 'Hello! I am AetherOps SRE Swarm Assistant. I am monitoring your AWS, GCP, and Kubernetes clusters. How can I assist with your cloud infrastructure today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: currentInput,
          incidentContext: selectedIncident ? {
            title: selectedIncident.title,
            service: selectedIncident.service,
            status: selectedIncident.status,
          } : undefined,
        }),
      });

      const data = await res.json();

      const agentMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: 'agent',
        text: data.message || 'Processed your request.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch (err) {
      console.error('Error sending chat message:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'agent',
          text: 'Apologies, encountered a temporary issue connecting to the agent swarm backend.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
      
      {/* Header */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="font-bold text-sm text-slate-100">AI SRE Command Chat</h3>
            <p className="text-[10px] text-slate-400">Gemini 3.6 Flash Server Assistant</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start space-x-2 ${
              m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div className={`p-1.5 rounded-lg text-xs flex-shrink-0 ${
              m.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-cyan-400 border border-slate-700'
            }`}>
              {m.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
              m.sender === 'user'
                ? 'bg-indigo-600 text-white rounded-tr-none'
                : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-tl-none font-sans whitespace-pre-wrap'
            }`}>
              {m.text}
              <div className={`text-[9px] mt-1 ${m.sender === 'user' ? 'text-indigo-200 text-right' : 'text-slate-500'}`}>
                {m.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 text-xs text-cyan-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>Agent Swarm processing response...</span>
          </div>
        )}
      </div>

      {/* Quick Prompt Suggestions */}
      <div className="p-2 bg-slate-950 border-t border-slate-800 text-[10px] flex gap-1.5 overflow-x-auto">
        <button
          onClick={() => setInput('Scale deployment order-processor-v3 to 5 replicas')}
          className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 whitespace-nowrap"
        >
          Scale Deployment
        </button>
        <button
          onClick={() => setInput('Check PostgreSQL connection pool metrics')}
          className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 whitespace-nowrap"
        >
          Check DB Health
        </button>
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center space-x-2">
        <input
          type="text"
          placeholder="Type SRE command or query..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
};
