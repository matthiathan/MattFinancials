import React, { useState, useRef, useEffect } from 'react';
import { Card } from '../ui/Card';
import { 
  Send, 
  Bot, 
  User as UserIcon, 
  Sparkles, 
  ArrowRight,
  Loader2,
  RefreshCcw,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { streamAdvisorResponse } from '../../services/aiService';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_PROMPTS = [
  "How can I reduce my spending?",
  "Am I saving enough for my goals?",
  "What is my savings rate this month?",
  "Which category costs me the most?"
];

export function AIAdvisor() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Greetings. I am your AI Financial Intelligence Unit. I have analyzed your transactions, budgets, and objectives. How shall we optimize your capital today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const [context, setContext] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchContext() {
      if (!user) return;
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .limit(50);
      const { data: budgets } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id);
      const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id);
      setContext({ transactions, budgets, goals });
    }
    fetchContext();
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isTyping) return;

    // Rate limiting: 3 seconds between requests
    const now = Date.now();
    if (now - lastRequestTime < 3000) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Please wait a moment before sending another request. Neural link is cooling down." }]);
      return;
    }
    setLastRequestTime(now);

    const userMessage: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    let assistantContent = '';
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const stream = streamAdvisorResponse(text, context);
      for await (const chunk of stream) {
        assistantContent += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = assistantContent;
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Chat Error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Financial Intelligence Unit</h2>
          <p className="text-slate-400">Secure neural link for personalized financial optimization.</p>
        </div>
        <button 
          type="button"
          onClick={() => setMessages([{ role: 'assistant', content: "Neural link reset. How shall we proceed with your financial optimization?" }])}
          className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-xl transition-all duration-300 font-bold text-xs uppercase tracking-widest active:scale-95 group"
        >
          <RefreshCcw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
          Reset Link
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Chat Area */}
        <Card className="flex-1 flex flex-col p-0 overflow-hidden border-border/50 bg-card/20 backdrop-blur-xl">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth custom-scrollbar"
          >
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-4 max-w-[85%]",
                    msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-lg border",
                    msg.role === 'assistant' 
                      ? "bg-primary text-white border-primary/50 shadow-primary/20" 
                      : "bg-white/5 text-slate-400 border-white/10"
                  )}>
                    {msg.role === 'assistant' ? <Bot size={18} /> : <UserIcon size={18} />}
                  </div>
                  <div className={cn(
                    "p-4 rounded-2xl text-sm leading-relaxed shadow-xl border",
                    msg.role === 'assistant' 
                      ? "bg-white/5 text-slate-200 rounded-tl-none border-white/10" 
                      : "bg-primary text-white rounded-tr-none border-primary/50 shadow-primary/10"
                  )}>
                    {msg.content || (isTyping && i === messages.length - 1 ? <Loader2 className="animate-spin" size={16} /> : null)}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="p-4 border-t border-border bg-card/40">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="relative"
            >
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Initialize query..."
                className="w-full bg-background/50 border border-border rounded-2xl py-4 pl-6 pr-14 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 focus:shadow-[0_0_20px_rgba(99,102,241,0.1)] transition-all duration-300 shadow-inner"
              />
              <button 
                type="submit"
                disabled={!input.trim() || isTyping}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-90 group"
              >
                <Send size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </form>
          </div>
        </Card>

        {/* Sidebar Suggestions */}
        <div className="w-full lg:w-80 space-y-6">
          <Card className="bg-primary/10 border-primary/30 shadow-xl relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10">
              <Sparkles size={120} className="text-primary" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={20} className="text-primary" />
                <h3 className="font-bold text-white">Smart Queries</h3>
              </div>
              <div className="space-y-3">
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSend(prompt)}
                    className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-primary/10 border border-white/5 hover:border-primary/30 transition-all duration-300 text-[10px] font-bold uppercase tracking-widest text-slate-300 hover:text-white flex items-center justify-between group active:scale-[0.98] hover:shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                  >
                    {prompt}
                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 text-primary drop-shadow-[0_0_5px_rgba(99,102,241,0.8)]" />
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Card className="border-border/50 bg-card/20">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={16} className="text-success" />
              <h3 className="font-bold text-white text-sm">Security Protocol</h3>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
              Your financial data is encrypted and only used to provide personalized insights. We never share your data with third parties.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
