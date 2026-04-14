import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { 
  Plus, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  AlertCircle,
  Loader2,
  Zap
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';
import { supabase } from '../../lib/supabase';
import { Budget } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { cn, formatCurrency } from '../../lib/utils';

export function Budgets() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<{name: string, budget: number, actual: number}[]>([]);
  const [totalHealth, setTotalHealth] = useState({ spent: 0, limit: 0 });

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      
      // Fetch budgets
      const { data: budgetData } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id);
      
      // Fetch transactions to calculate actual spending
      const { data: txData } = await supabase
        .from('transactions')
        .select('amount, category, type')
        .eq('user_id', user.id)
        .eq('type', 'expense');

      if (budgetData) {
        setBudgets(budgetData);
        
        const calculatedData = budgetData.map(b => {
          const actual = txData
            ?.filter(tx => tx.category === b.category)
            .reduce((sum, tx) => sum + Math.abs(tx.amount), 0) || 0;
          
          return {
            name: b.category,
            budget: b.limit_amount,
            actual: actual
          };
        });

        setChartData(calculatedData);

        const totalLimit = budgetData.reduce((sum, b) => sum + b.limit_amount, 0);
        const totalSpent = calculatedData.reduce((sum, d) => sum + d.actual, 0);
        setTotalHealth({ spent: totalSpent, limit: totalLimit });
      }
      setLoading(false);
    }
    fetchData();
  }, [user]);

  const healthPercentage = totalHealth.limit > 0 ? (totalHealth.spent / totalHealth.limit) * 100 : 0;
  const overBudgetCategories = chartData.filter(d => d.actual > d.budget);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Budget Allocation</h2>
          <p className="text-slate-400">Manage your monthly spending limits by sector.</p>
        </div>
        <button className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
          <Plus size={18} />
          Create Budget
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Budget vs Actual</CardTitle>
            <CardDescription>Current cycle performance metrics</CardDescription>
          </CardHeader>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" horizontal={false} />
                <XAxis type="number" stroke="#4B5563" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `R${value/1000}k`} />
                <YAxis dataKey="name" type="category" stroke="#4B5563" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  formatter={(value: number) => [formatCurrency(value), '']}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                <Bar dataKey="budget" fill="#1F2937" radius={[0, 4, 4, 0]} name="Budget Limit" />
                <Bar dataKey="actual" radius={[0, 4, 4, 0]} name="Actual Spent">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.actual > entry.budget ? '#EF4444' : '#6366F1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {chartData.length === 0 && !loading && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-xs font-bold uppercase tracking-widest">
                No budget data available
              </div>
            )}
          </div>
        </Card>

        <Card className="bg-primary/10 border-primary/30 shadow-xl shadow-primary/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Zap size={120} className="text-primary" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/20 rounded-lg text-primary">
                <TrendingUp size={20} />
              </div>
              <h3 className="font-bold text-lg text-white">Budget Health</h3>
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Total Budget Spent</span>
                  <span className="font-black text-white">{healthPercentage.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(99,102,241,0.5)]",
                      healthPercentage > 100 ? "bg-error" : "bg-primary"
                    )} 
                    style={{ width: `${Math.min(healthPercentage, 100)}%` }} 
                  />
                </div>
              </div>
              <div className={cn(
                "p-4 rounded-2xl border",
                overBudgetCategories.length > 0 ? "bg-error/10 border-error/20" : "bg-success/10 border-success/20"
              )}>
                <div className="flex items-start gap-3">
                  {overBudgetCategories.length > 0 ? (
                    <>
                      <AlertCircle size={18} className="shrink-0 mt-0.5 text-error" />
                      <p className="text-xs leading-relaxed text-slate-300">
                        Critical alert: You've exceeded your <strong className="text-error">{overBudgetCategories[0].name}</strong> budget by {formatCurrency(overBudgetCategories[0].actual - overBudgetCategories[0].budget)}. AI suggests reviewing your spending in this category.
                      </p>
                    </>
                  ) : (
                    <>
                      <Zap size={18} className="shrink-0 mt-0.5 text-success" />
                      <p className="text-xs leading-relaxed text-slate-300">
                        System Status: All budgets optimized. Your spending is currently within the defined parameters.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-slate-500"><Loader2 className="animate-spin mx-auto mb-2" /> Synchronizing budgets...</div>
        ) : budgets.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-500">No budget streams initialized.</div>
        ) : budgets.map((budget) => {
          const progress = (budget.spent_amount / budget.limit_amount) * 100;
          const isOver = progress > 100;

          return (
            <Card key={budget.id} className="hover:border-primary/50 transition-all group border-border/50">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-white">{budget.category}</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Limit: {formatCurrency(budget.limit_amount)}</p>
                </div>
                <div className={cn(
                  "p-2 rounded-lg border",
                  isOver ? "bg-error/10 text-error border-error/20" : "bg-primary/10 text-primary border-primary/20"
                )}>
                  <PieChartIcon size={20} />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-slate-500">Spent: {formatCurrency(budget.spent_amount)}</span>
                  <span className={isOver ? "text-error" : "text-primary"}>{progress.toFixed(0)}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      isOver ? "bg-error shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-primary shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                    )} 
                    style={{ width: `${Math.min(progress, 100)}%` }} 
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
