import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  PieChart as PieChartIcon,
  Globe
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { supabase } from '../../lib/supabase';
import { Investment } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { cn, formatCurrency } from '../../lib/utils';

const lineData = [
  { name: 'Jan', value: 650000 },
  { name: 'Feb', value: 680000 },
  { name: 'Mar', value: 670000 },
  { name: 'Apr', value: 720000 },
  { name: 'May', value: 780000 },
  { name: 'Jun', value: 850000 },
];

const pieData = [
  { name: 'Stocks', value: 60 },
  { name: 'Bonds', value: 20 },
  { name: 'Crypto', value: 10 },
  { name: 'Cash', value: 10 },
];

const COLORS = ['#6366F1', '#22D3EE', '#EF4444', '#10B981'];

export function Investments() {
  const { user } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      const { data } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id);
      if (data) setInvestments(data);
      setLoading(false);
    }
    fetchData();
  }, [user]);

  const totalValue = investments.reduce((sum, inv) => sum + (inv.shares * inv.current_price), 0);
  const totalCost = investments.reduce((sum, inv) => sum + (inv.shares * inv.avg_price), 0);
  const totalGain = totalValue - totalCost;
  const gainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Portfolio Management</h2>
          <p className="text-slate-400">Track your asset performance and global market allocation.</p>
        </div>
        <button className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
          <Plus size={18} />
          Add Holding
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary/10 border-primary/30 shadow-xl relative overflow-hidden">
          <div className="absolute -right-2 -bottom-2 opacity-10">
            <Globe size={100} className="text-primary" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Portfolio Value</p>
            <h3 className="text-3xl font-black text-white mb-4 font-mono">{formatCurrency(totalValue)}</h3>
            <div className="flex items-center gap-2 text-xs font-bold bg-success/20 text-success w-fit px-3 py-1 rounded-full border border-success/20">
              <TrendingUp size={14} />
              +{gainPercent.toFixed(2)}% ({formatCurrency(totalGain)})
            </div>
          </div>
        </Card>
        <Card>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Day Change</p>
          <h3 className="text-3xl font-black text-white mb-4 font-mono">+{formatCurrency(1240.50)}</h3>
          <div className="flex items-center gap-2 text-xs font-bold text-success">
            <ArrowUpRight size={16} />
            +1.45%
          </div>
        </Card>
        <Card>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Annual Dividend Yield</p>
          <h3 className="text-3xl font-black text-white mb-4 font-mono">3.2%</h3>
          <div className="flex items-center gap-2 text-xs font-bold text-primary">
            <PieChartIcon size={16} />
            {formatCurrency(24500)} / year
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Performance Trajectory</CardTitle>
            <CardDescription>Portfolio magnitude over the last 6 months</CardDescription>
          </CardHeader>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={lineData}>
                <defs>
                  <linearGradient id="colorInvest" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis dataKey="name" stroke="#4B5563" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#4B5563" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `R${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px' }}
                  formatter={(value: number) => [formatCurrency(value), 'Portfolio Value']}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#6366F1" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorInvest)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
            <CardDescription>Current magnitude distribution</CardDescription>
          </CardHeader>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-white/5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.name}</span>
                <span className="ml-auto text-[10px] text-white font-black">{item.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden border-border/50">
        <div className="p-6 border-b border-border bg-card/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle>Holdings Ledger</CardTitle>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text"
              placeholder="Search ticker..."
              className="w-full bg-background/50 border border-border rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-border bg-card/10">
                <th className="py-4 px-6 font-bold text-slate-500 text-[10px] uppercase tracking-widest">Ticker</th>
                <th className="py-4 px-6 font-bold text-slate-500 text-[10px] uppercase tracking-widest text-right">Shares</th>
                <th className="py-4 px-6 font-bold text-slate-500 text-[10px] uppercase tracking-widest text-right">Avg Price</th>
                <th className="py-4 px-6 font-bold text-slate-500 text-[10px] uppercase tracking-widest text-right">Current Price</th>
                <th className="py-4 px-6 font-bold text-slate-500 text-[10px] uppercase tracking-widest text-right">Total Value</th>
                <th className="py-4 px-6 font-bold text-slate-500 text-[10px] uppercase tracking-widest text-right">Gain/Loss</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr><td colSpan={6} className="py-20 text-center text-slate-500"><Loader2 className="animate-spin mx-auto mb-2" /> Processing holdings...</td></tr>
              ) : investments.length === 0 ? (
                <tr><td colSpan={6} className="py-20 text-center text-slate-500">No active holdings found.</td></tr>
              ) : investments.map((inv) => {
                const value = inv.shares * inv.current_price;
                const cost = inv.shares * inv.avg_price;
                const gain = value - cost;
                const gainP = (gain / cost) * 100;
                const isPositive = gain >= 0;

                return (
                  <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center font-black text-primary text-xs shadow-lg shadow-primary/5">
                          {inv.ticker[0]}
                        </div>
                        <span className="font-bold text-white">{inv.ticker}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right text-sm text-slate-400 font-mono">{inv.shares}</td>
                    <td className="py-4 px-6 text-right text-sm text-slate-400 font-mono">{formatCurrency(inv.avg_price)}</td>
                    <td className="py-4 px-6 text-right text-sm text-slate-200 font-black font-mono">{formatCurrency(inv.current_price)}</td>
                    <td className="py-4 px-6 text-right font-black text-white font-mono">{formatCurrency(value)}</td>
                    <td className={cn(
                      "py-4 px-6 text-right font-black font-mono",
                      isPositive ? "text-success" : "text-error"
                    )}>
                      <div className="flex items-center justify-end gap-1">
                        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {isPositive ? '+' : ''}{gainP.toFixed(2)}%
                      </div>
                      <span className="text-[10px] opacity-70 block">{formatCurrency(Math.abs(gain))}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
