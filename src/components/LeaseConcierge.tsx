'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare, X, Send } from 'lucide-react';
import { getAssetPath } from '@/lib/basePath';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const INITIAL_WELCOME: Message = {
  id: 'msg-welcome',
  role: 'assistant',
  content: `Welcome to the Firstgen Concierge Desk. 

I can assist your corporate treasury with asset availability and pricing across our 24 institutional portfolios (Luxury Fleet, Construction & Warehouse, and Enterprise IT Hardware), 48-hour delivery SLAs, ₹0 down payment terms, or required onboarding documentation.

How may I assist your capital deployment today?`,
  timestamp: 'JUST NOW',
};

const QUICK_PROMPTS = [
  'What documents are required?',
  'How fast is 48-hour delivery?',
  'Compare Luxury Fleet options',
];

// Helper to format assistant markdown links [text](url) and **bold**
function FormattedMessage({ text }: { text: string }) {
  // Split text by lines
  const lines = text.split('\n');

  return (
    <div className="space-y-2">
      {lines.map((line, lIdx) => {
        if (!line.trim()) return <div key={lIdx} className="h-1.5" />;

        // Match markdown links [label](href)
        const parts: React.ReactNode[] = [];
        let remaining = line;
        let pIdx = 0;

        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/;

        while (remaining.length > 0) {
          const match = linkRegex.exec(remaining);
          if (!match) {
            parts.push(renderBold(remaining, pIdx++));
            break;
          }

          const matchIndex = match.index;
          if (matchIndex > 0) {
            parts.push(renderBold(remaining.slice(0, matchIndex), pIdx++));
          }

          const label = match[1];
          const href = match[2];

          parts.push(
            <Link
              key={pIdx++}
              href={href}
              className="text-[#C27D4B] underline underline-offset-2 hover:text-[#D89564] font-medium transition-colors"
            >
              {label}
            </Link>
          );

          remaining = remaining.slice(matchIndex + match[0].length);
        }

        return (
          <p key={lIdx} className="leading-relaxed">
            {parts}
          </p>
        );
      })}
    </div>
  );
}

function renderBold(text: string, keyPrefix: number): React.ReactNode {
  const boldParts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <React.Fragment key={keyPrefix}>
      {boldParts.map((bp, i) => {
        if (bp.startsWith('**') && bp.endsWith('**')) {
          return (
            <strong key={i} className="font-semibold text-white">
              {bp.slice(2, -2)}
            </strong>
          );
        }
        return bp;
      })}
    </React.Fragment>
  );
}

export default function LeaseConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_WELCOME]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Auto-focus input on open
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const chatApiUrl = getAssetPath('/api/chat/');
      const response = await fetch(chatApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMsg: Message = {
          id: `ast-${Date.now()}`,
          role: 'assistant',
          content: data.reply || 'Our Concierge desk is reviewing your request.',
          timestamp: new Date().toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error('API response failed');
      }
    } catch {
      // Fallback response if network or endpoint fails
      const fallbackMsg: Message = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: `Our concierge desk is currently processing high volume. You can immediately browse our [Asset Catalogue](/lease), check required [Verification Documents](/verify), or submit a direct [Lease Application](/apply).`,
        timestamp: new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="select-none">
      {/* ========================================================
          1. CHATBOT WINDOW (Opens above sticky button)
          ======================================================== */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Firstgen Operating Lease Concierge"
          className="fixed inset-x-3 sm:inset-x-auto sm:right-6 bottom-16 sm:bottom-20 z-50 w-auto sm:w-[380px] h-[480px] sm:h-[520px] max-h-[calc(100dvh-5rem)] bg-[#0E0F11] border border-[#C27D4B] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header */}
          <div className="bg-[#17191D] px-4 py-3 border-b border-[#C27D4B]/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#C27D4B] animate-pulse" />
              <div>
                <div className="font-mono text-[11px] font-bold text-[#F4F2EE] tracking-widest uppercase">
                  Firstgen Concierge
                </div>
                <div className="font-mono text-[9px] text-[#C27D4B] tracking-[0.2em] uppercase">
                  Operating Lease Desk
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-[#F4F2EE]/60 hover:text-[#C27D4B] transition-colors font-mono"
              aria-label="Close concierge window"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages List (data-lenis-prevent prevents Lenis hijacking) */}
          <div
            data-lenis-prevent="true"
            className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs bg-[#0E0F11]"
          >
            {messages.map((m) => {
              const isAst = m.role === 'assistant';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isAst ? 'items-start' : 'items-end'}`}
                >
                  {/* Timestamp & Sender */}
                  <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-wider text-[#C27D4B] mb-1">
                    <span>{isAst ? 'FIRSTGEN DESK' : 'YOU'}</span>
                    <span className="text-white/30">•</span>
                    <span className="text-white/50">{m.timestamp}</span>
                  </div>

                  {/* Bubble */}
                  <div
                    className={`p-3.5 leading-relaxed rounded-none border ${
                      isAst
                        ? 'bg-[#17191D] border-white/[0.08] text-[#F4F2EE]/90 max-w-[92%]'
                        : 'bg-[#C27D4B]/15 border-[#C27D4B]/50 text-[#F4F2EE] max-w-[85%]'
                    }`}
                  >
                    {isAst ? (
                      <FormattedMessage text={m.content} />
                    ) : (
                      <p>{m.content}</p>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Quick Prompt Chips (displayed at start or below conversation) */}
            {messages.length <= 2 && !isLoading && (
              <div className="pt-2 space-y-1.5">
                <div className="text-[9px] font-mono uppercase tracking-widest text-[#C27D4B]/70 mb-2">
                  Frequently Inquired:
                </div>
                <div className="flex flex-col gap-1.5">
                  {QUICK_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt)}
                      className="text-left px-3 py-2 bg-[#17191D] border border-[#C27D4B]/30 hover:border-[#C27D4B] hover:bg-[#C27D4B]/10 text-xs font-mono text-[#F4F2EE]/85 transition-colors flex items-center justify-between group"
                    >
                      <span>{prompt}</span>
                      <span className="text-[#C27D4B] group-hover:translate-x-0.5 transition-transform text-[10px]">
                        →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading / Evaluating State */}
            {isLoading && (
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-wider text-[#C27D4B] mb-1">
                  <span>FIRSTGEN DESK</span>
                  <span className="text-white/30">•</span>
                  <span className="text-white/50">PROCESSING</span>
                </div>
                <div className="p-3 bg-[#17191D] border border-white/[0.08] text-[#C27D4B] font-mono text-[11px] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C27D4B] animate-ping" />
                  <span>Evaluating inquiry...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-[#17191D] border-t border-[#C27D4B]/30 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about pricing, 48h delivery, docs..."
              className="bg-[#0E0F11] border border-white/15 px-3 py-2 text-sm sm:text-xs font-mono text-[#F4F2EE] placeholder-white/30 focus:outline-none focus:border-[#C27D4B] flex-1"
              disabled={isLoading}
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isLoading}
              className={`p-2 transition-colors flex items-center justify-center font-mono ${
                input.trim() && !isLoading
                  ? 'bg-[#C27D4B] text-[#0E0F11] hover:bg-[#D89564] cursor-pointer'
                  : 'bg-white/10 text-white/30 cursor-not-allowed'
              }`}
              aria-label="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          2. STICKY TRIGGER BUTTON (bottom-4 right-4 sm:bottom-6 sm:right-6 z-50)
          ======================================================== */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-[#0E0F11] border border-[#C27D4B] hover:border-[#D89564] shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2.5 p-3 sm:px-4 sm:py-2.5 group"
        aria-label={isOpen ? 'Close Firstgen Concierge' : 'Open Firstgen Concierge'}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C27D4B] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C27D4B]" />
        </span>

        {/* Desktop Label */}
        <span className="hidden sm:inline-block font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#F4F2EE] group-hover:text-white transition-colors">
          {isOpen ? 'Close Concierge' : 'Concierge'}
        </span>

        {/* Mobile Icon */}
        <span className="sm:hidden text-[#C27D4B]">
          {isOpen ? <X className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
        </span>
      </button>
    </div>
  );
}
