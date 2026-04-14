import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { 
  Target, 
  Plus, 
  TrendingUp, 
  ChevronRight,
  Loader2,
  Trophy
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { supabase } from '../../lib/supabase';
import { Goal } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { cn, formatCurrency } from '../../lib/utils';

export function Goals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      const { data } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id);
      if (data) setGoals(data);
      setLoading(false);
    }
    fetchData();
  }, [user]);

  const chartData = goals.map(g => ({
    name: g.name,
    progress: (g.current_amount / g.target_amount) * 100,
    current: g.current_amount,
    target: g.target_amount
  }));

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Financial Objectives</h2>
          <p className="text-slate-400">Track your progress towards major life milestones and acquisitions.</p>
        </div>
        <button className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
          <Plus size={18} />
          New Objective
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Objective Progress</CardTitle>
            <CardDescription>Visual comparison of all active financial targets</CardDescription>
          </CardHeader>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} stroke="#4B5563" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                <YAxis dataKey="name" type="category" stroke="#4B5563" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px' }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Progress']}
                />
                <Bar dataKey="progress" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.progress >= 100 ? '#10B981' : '#6366F1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bg-card/40 border-border shadow-xl relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-5">
            <Trophy size={160} className="text-primary" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/20 rounded-lg text-primary">
                <TrendingUp size={20} />
              </div>
              <h3 className="font-bold text-lg text-white">Objective Insights</h3>
            </div>
            <div className="space-y-6">
              {goals.length === 0 ? (
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    "No active objectives. Define your financial targets to receive neural insights."
                  </p>
                </div>
              ) : (
                <>
                  {goals.sort((a, b) => (b.current_amount / b.target_amount) - (a.current_amount / a.target_amount)).slice(0, 1).map((goal, i) => (
                    <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[10px] text-slate-500 mb-2 uppercase font-bold tracking-widest">Top Performer</p>
                      <h4 className="font-bold text-white mb-1">{goal.name}</h4>
                      <p className="text-xs text-success font-bold">
                        {((goal.current_amount / goal.target_amount) * 100).toFixed(0)}% Complete • {formatCurrency(goal.target_amount - goal.current_amount)} to go
                      </p>
                    </div>
                  ))}
                  {goals.sort((a, b) => (a.current_amount / a.target_amount) - (b.current_amount / b.target_amount)).slice(0, 1).map((goal, i) => (
                    <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[10px] text-slate-500 mb-2 uppercase font-bold tracking-widest">Needs Attention</p>
                      <h4 className="font-bold text-white mb-1">{goal.name}</h4>
                      <p className="text-xs text-secondary font-bold">
                        {((goal.current_amount / goal.target_amount) * 100).toFixed(0)}% Complete • {formatCurrency(goal.target_amount - goal.current_amount)} to go
                      </p>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-slate-500"><Loader2 className="animate-spin mx-auto mb-2" /> Synchronizing objectives...</div>
        ) : goals.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-500">No active objectives found.</div>
        ) : goals.map((goal) => {
          const progress = (goal.current_amount / goal.target_amount) * 100;
          
          return (
            <Card key={goal.id} className="hover:border-primary/50 transition-all group cursor-pointer border-border/50">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-300 border border-white/5">
                  <Target size={24} />
                </div>
                <button className="p-2 text-slate-600 hover:text-primary transition-colors">
                  <ChevronRight size={20} />
                </button>
              </div>
              
              <h4 className="text-xl font-bold text-white mb-1">{goal.name}</h4>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-6">Target: {formatCurrency(goal.target_amount)}</p>
              
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-white font-mono">{formatCurrency(goal.current_amount)}</span>
                  <span className="text-primary">{progress.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(99,102,241,0.5)]" 
                    style={{ width: `${Math.min(progress, 100)}%` }} 
                  />
                </div>
              </div>

              <button className="w-full mt-6 py-2.5 bg-white/5 text-primary rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition-all border border-primary/20">
                Inject Funds
              </button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
