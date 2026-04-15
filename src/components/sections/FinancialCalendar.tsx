import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  DollarSign,
  CreditCard,
  Zap,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { FinancialEvent } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { cn, formatCurrency } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function FinancialCalendar() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<FinancialEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [currentDate, user]);

  async function fetchEvents() {
    if (!user) return;
    setLoading(true);
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString();

    const { data } = await supabase
      .from('financial_events')
      .select('*')
      .eq('user_id', user.id)
      .gte('event_date', startOfMonth)
      .lte('event_date', endOfMonth);

    if (data) setEvents(data);
    setLoading(false);
  }

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'salary': return <DollarSign size={14} />;
      case 'bill': return <CreditCard size={14} />;
      case 'subscription': return <Zap size={14} />;
      case 'investment': return <TrendingUp size={14} />;
      default: return <DollarSign size={14} />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'salary': return 'bg-success/20 text-success border-success/30';
      case 'bill': return 'bg-error/20 text-error border-error/30';
      case 'subscription': return 'bg-primary/20 text-primary border-primary/30';
      case 'investment': return 'bg-secondary/20 text-secondary border-secondary/30';
      default: return 'bg-white/5 text-slate-400 border-white/10';
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Financial Calendar</h2>
          <p className="text-slate-400">Visualize your cash flow trajectory and upcoming obligations.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-card/40 border border-border rounded-xl p-1">
            <button 
              type="button"
              onClick={prevMonth} 
              className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-primary transition-all duration-300 active:scale-90 hover:shadow-[0_0_10px_rgba(99,102,241,0.2)]"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="px-4 font-bold text-white min-w-[140px] text-center">
              {monthName} {year}
            </span>
            <button 
              type="button"
              onClick={nextMonth} 
              className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-primary transition-all duration-300 active:scale-90 hover:shadow-[0_0_10px_rgba(99,102,241,0.2)]"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <button 
            type="button"
            className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95 flex items-center gap-2 group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform" />
            Add Event
          </button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden border-border/50 bg-card/20 backdrop-blur-xl">
        <div className="grid grid-cols-7 border-b border-border bg-card/40">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 auto-rows-[120px]">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="border-r border-b border-border/50 bg-white/[0.01]" />
          ))}
          
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
            const dayEvents = events.filter(e => e.event_date === dateStr);
            const isToday = new Date().toISOString().split('T')[0] === dateStr;

            return (
              <div key={day} className={cn(
                "border-r border-b border-border/50 p-2 transition-colors hover:bg-white/[0.02] flex flex-col gap-1 overflow-hidden",
                isToday && "bg-primary/5"
              )}>
                <div className="flex justify-between items-center mb-1">
                  <span className={cn(
                    "text-xs font-bold",
                    isToday ? "text-primary" : "text-slate-500"
                  )}>
                    {day}
                  </span>
                  {isToday && <div className="w-1 h-1 rounded-full bg-primary shadow-[0_0_8px_rgba(99,102,241,1)]" />}
                </div>
                
                <div className="space-y-1 overflow-y-auto custom-scrollbar pr-0.5">
                  {dayEvents.map(event => (
                    <motion.div 
                      key={event.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={cn(
                        "px-1.5 py-1 rounded-md border text-[9px] font-bold truncate flex items-center gap-1",
                        getEventColor(event.event_type)
                      )}
                    >
                      {getEventIcon(event.event_type)}
                      <span>{event.title}</span>
                      <span className="ml-auto opacity-80">{formatCurrency(event.amount)}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-success/10 border-success/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-success/20 rounded-lg text-success">
              <DollarSign size={20} />
            </div>
            <h3 className="font-bold text-white">Projected Inflow</h3>
          </div>
          <p className="text-2xl font-black text-white font-mono">
            {formatCurrency(events.filter(e => e.event_type === 'salary').reduce((sum, e) => sum + e.amount, 0))}
          </p>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Total for {monthName}</p>
        </Card>

        <Card className="bg-error/10 border-error/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-error/20 rounded-lg text-error">
              <CreditCard size={20} />
            </div>
            <h3 className="font-bold text-white">Projected Outflow</h3>
          </div>
          <p className="text-2xl font-black text-white font-mono">
            {formatCurrency(events.filter(e => e.event_type !== 'salary').reduce((sum, e) => sum + e.amount, 0))}
          </p>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Total for {monthName}</p>
        </Card>

        <Card className="bg-primary/10 border-primary/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/20 rounded-lg text-primary">
              <Zap size={20} />
            </div>
            <h3 className="font-bold text-white">Net Position</h3>
          </div>
          <p className="text-2xl font-black text-white font-mono">
            {formatCurrency(
              events.filter(e => e.event_type === 'salary').reduce((sum, e) => sum + e.amount, 0) -
              events.filter(e => e.event_type !== 'salary').reduce((sum, e) => sum + e.amount, 0)
            )}
          </p>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Projected Balance</p>
        </Card>
      </div>
    </div>
  );
}
