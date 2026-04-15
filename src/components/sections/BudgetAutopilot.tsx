import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { 
  Zap, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  ArrowRight,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { BudgetRecommendation, Budget } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { cn, formatCurrency } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
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

export function BudgetAutopilot() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<BudgetRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, [user]);

  async function fetchRecommendations() {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('budget_recommendations')
      .select('*')
      .eq('user_id', user.id);
    if (data) setRecommendations(data);
    setLoading(false);
  }

  const handleAccept = async (rec: BudgetRecommendation) => {
    if (!user) return;
    setProcessingId(rec.id);
    try {
      // 1. Create or Update Budget
      const { data: existingBudget } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('category', rec.category)
        .single();

      if (existingBudget) {
        await supabase
          .from('budgets')
          .update({ limit_amount: rec.suggested_budget })
          .eq('id', existingBudget.id);
      } else {
        await supabase
          .from('budgets')
          .insert({
            user_id: user.id,
            category: rec.category,
            limit_amount: rec.suggested_budget,
            spent_amount: 0
          });
      }

      // 2. Remove recommendation
      await supabase
        .from('budget_recommendations')
        .delete()
        .eq('id', rec.id)
        .eq('user_id', user.id);
      setRecommendations(prev => prev.filter(r => r.id !== rec.id));
    } catch (error) {
      console.error("Error accepting budget:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const chartData = recommendations.map(r => ({
    name: r.category,
    average: r.average_spending,
    suggested: r.suggested_budget
  }));

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Budget Autopilot</h2>
          <p className="text-slate-400">AI-driven resource allocation based on historical spending patterns.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-xl text-primary text-xs font-bold uppercase tracking-widest">
          <Sparkles size={14} />
          AI Active
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Magnitude Comparison</CardTitle>
            <CardDescription>Average spending vs. suggested AI allocation</CardDescription>
          </CardHeader>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis dataKey="name" stroke="#4B5563" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#4B5563" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `R${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px' }}
                  formatter={(value: number) => [formatCurrency(value), '']}
                />
                <Bar dataKey="average" fill="#4B5563" radius={[4, 4, 0, 0]} />
                <Bar dataKey="suggested" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bg-primary/10 border-primary/30 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-5">
            <Zap size={160} className="text-primary" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/20 rounded-lg text-primary">
                <Sparkles size={20} />
              </div>
              <h3 className="font-bold text-lg text-white">Neural Insights</h3>
            </div>
            <div className="space-y-6">
              {recommendations.length === 0 ? (
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-slate-500 mb-2 uppercase font-bold tracking-widest">System Status</p>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    "All financial sectors are currently optimized. No new neural insights detected."
                  </p>
                </div>
              ) : recommendations.slice(0, 2).map((rec, i) => (
                <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-slate-500 mb-2 uppercase font-bold tracking-widest">{i === 0 ? 'Efficiency Alert' : 'Optimization Tip'}</p>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    "Your average {rec.category.toLowerCase()} spending is {formatCurrency(rec.average_spending)} per month. Suggested allocation: {formatCurrency(rec.suggested_budget)}."
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-slate-500">
            <Loader2 className="animate-spin mx-auto mb-2" />
            <p className="font-bold uppercase tracking-widest text-xs">Generating Recommendations...</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-500 border-2 border-dashed border-border rounded-3xl">
            <CheckCircle2 size={48} className="mx-auto mb-4 opacity-20 text-success" />
            <p className="font-bold uppercase tracking-widest text-xs">All budgets optimized.</p>
          </div>
        ) : recommendations.map((rec) => (
          <Card key={rec.id} className="hover:border-primary/50 transition-all group border-border/50">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary border border-white/5 shadow-lg shadow-primary/5">
                <BarChart3 size={24} />
              </div>
              <div className="px-2 py-1 bg-success/20 text-success text-[10px] font-black rounded-lg uppercase tracking-widest">
                {rec.confidence}% Match
              </div>
            </div>
            
            <h4 className="text-xl font-bold text-white mb-1">{rec.category}</h4>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-6">Suggested Allocation</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">Average</p>
                <p className="text-sm font-black text-white font-mono">{formatCurrency(rec.average_spending)}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                <p className="text-[9px] text-primary font-bold uppercase tracking-widest mb-1">Suggested</p>
                <p className="text-sm font-black text-white font-mono">{formatCurrency(rec.suggested_budget)}</p>
              </div>
            </div>

            <button 
              type="button"
              onClick={() => handleAccept(rec)}
              disabled={processingId === rec.id}
              className="w-full py-3 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95 disabled:opacity-50 group"
            >
              {processingId === rec.id ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Zap size={16} className="group-hover:animate-pulse" />
              )}
              Accept Budget
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
