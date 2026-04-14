import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Loader2,
  ArrowUpRight,
  Info,
  Activity,
  CreditCard
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { CreditScore as CreditScoreType } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { cn, formatCurrency } from '../../lib/utils';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

export function CreditScore() {
  const { user } = useAuth();
  const [scores, setScores] = useState<CreditScoreType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScores();
  }, [user]);

  async function fetchScores() {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('credit_scores')
      .select('*')
      .eq('user_id', user.id)
      .order('recorded_at', { ascending: true });
    
    if (data) setScores(data);
    setLoading(false);
  }

  const currentScore = scores.length > 0 ? scores[scores.length - 1] : null;
  const prevScore = scores.length > 1 ? scores[scores.length - 2] : null;
  const scoreDiff = currentScore && prevScore ? currentScore.score - prevScore.score : 0;

  const getScoreCategory = (score: number) => {
    if (score >= 800) return { label: 'Excellent', color: 'text-success', bg: 'bg-success/20' };
    if (score >= 740) return { label: 'Very Good', color: 'text-success', bg: 'bg-success/20' };
    if (score >= 670) return { label: 'Good', color: 'text-primary', bg: 'bg-primary/20' };
    if (score >= 580) return { label: 'Fair', color: 'text-secondary', bg: 'bg-secondary/20' };
    return { label: 'Poor', color: 'text-error', bg: 'bg-error/20' };
  };

  const category = currentScore ? getScoreCategory(currentScore.score) : null;

  const chartData = scores.map(s => ({
    date: new Date(s.recorded_at).toLocaleDateString('default', { month: 'short' }),
    score: s.score
  }));

  const utilization = currentScore?.credit_limit 
    ? (currentScore.credit_balance! / currentScore.credit_limit) * 100 
    : 0;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Credit Intelligence</h2>
          <p className="text-slate-400">Monitor your financial reputation and creditworthiness magnitude.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-success/10 border border-success/30 rounded-xl text-success text-xs font-bold uppercase tracking-widest">
          <ShieldCheck size={14} />
          Secure Monitoring
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden border-primary/30 bg-primary/5">
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <ShieldCheck size={160} className="text-primary" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Current Credit Score</p>
            <div className="flex items-baseline gap-4 mb-4">
              <h3 className="text-6xl font-black text-white font-mono">{currentScore?.score || '---'}</h3>
              {category && (
                <span className={cn("px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest", category.bg, category.color)}>
                  {category.label}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs font-bold">
              {scoreDiff !== 0 && (
                <span className={cn("flex items-center gap-1", scoreDiff > 0 ? "text-success" : "text-error")}>
                  {scoreDiff > 0 ? <ArrowUpRight size={14} /> : <TrendingDown size={14} />}
                  {scoreDiff > 0 ? '+' : ''}{scoreDiff} points
                </span>
              )}
              <span className="text-slate-500">since last month</span>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Score Trajectory</CardTitle>
            <CardDescription>Historical credit performance over time</CardDescription>
          </CardHeader>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis dataKey="date" stroke="#4B5563" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis domain={[300, 850]} stroke="#4B5563" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#6366F1" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/20 rounded-lg text-secondary">
                <Activity size={20} />
              </div>
              <h3 className="font-bold text-white">Credit Utilization</h3>
            </div>
            <span className={cn(
              "text-lg font-black font-mono",
              utilization > 30 ? "text-secondary" : "text-success"
            )}>
              {utilization.toFixed(1)}%
            </span>
          </div>
          
          <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 mb-6">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(34,211,238,0.5)]",
                utilization > 30 ? "bg-secondary" : "bg-success"
              )}
              style={{ width: `${Math.min(utilization, 100)}%` }} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Total Balance</p>
              <p className="text-xl font-black text-white font-mono">{formatCurrency(currentScore?.credit_balance || 0)}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Total Limit</p>
              <p className="text-xl font-black text-white font-mono">{formatCurrency(currentScore?.credit_limit || 0)}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-white/[0.02] border-border/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/20 rounded-lg text-primary">
              <Info size={20} />
            </div>
            <h3 className="font-bold text-white">Optimization Insights</h3>
          </div>
          <div className="space-y-4">
            {scores.length === 0 ? (
              <div className="p-4 bg-background/40 rounded-2xl border border-white/5">
                <p className="text-xs text-slate-400 leading-relaxed">
                  "No credit data detected. Connect your credit monitoring service to receive neural insights."
                </p>
              </div>
            ) : (
              <>
                <div className="flex gap-4 p-4 bg-background/40 rounded-2xl border border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center text-success shrink-0">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">Score Trajectory</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {scoreDiff > 0 
                        ? `Your credit score improved by ${scoreDiff} points recently. Maintain this momentum by keeping utilization low.`
                        : scoreDiff < 0 
                        ? `Your credit score decreased by ${Math.abs(scoreDiff)} points. Review your recent credit activity for anomalies.`
                        : "Your credit score has remained stable. Focus on long-term credit history to see further growth."}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 bg-background/40 rounded-2xl border border-white/5">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    utilization > 30 ? "bg-secondary/20 text-secondary" : "bg-success/20 text-success"
                  )}>
                    {utilization > 30 ? <AlertCircle size={20} /> : <ShieldCheck size={20} />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">Utilization Analysis</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {utilization > 30 
                        ? `Your credit utilization is ${utilization.toFixed(0)}%. Reducing it below 30% could significantly improve your credit score.`
                        : `Your credit utilization is healthy at ${utilization.toFixed(0)}%. This is a key driver for your current score category.`}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden border-border/50">
        <div className="p-6 border-b border-border bg-card/20">
          <CardTitle>Score Categories</CardTitle>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 divide-x divide-border/50">
          {[
            { range: '300–579', label: 'Poor', color: 'text-error' },
            { range: '580–669', label: 'Fair', color: 'text-secondary' },
            { range: '670–739', label: 'Good', color: 'text-primary' },
            { range: '740–799', label: 'Very Good', color: 'text-success' },
            { range: '800–850', label: 'Excellent', color: 'text-success' },
          ].map((cat, i) => (
            <div key={i} className="p-6 text-center">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">{cat.range}</p>
              <p className={cn("text-sm font-black uppercase tracking-widest", cat.color)}>{cat.label}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
