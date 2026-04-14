import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus,
  Search,
  Activity
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
import { useAuth } from '../../contexts/AuthContext';
import { cn, formatCurrency } from '../../lib/utils';

const COLORS = ['#6366F1', '#EF4444'];

export function NetWorth() {
  const { user } = useAuth();
  const [investments, setInvestments] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [allocationData, setAllocationData] = useState<any[]>([]);
  const [liabilities, setLiabilities] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      setLoading(true);

      const { data: invData } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id);

      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id);

      if (invData && txData) {
        setInvestments(invData);
        setTransactions(txData);

        // Calculate Net Worth over time (last 6 months)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const history = [];
        const totalInvestmentValue = invData.reduce((sum, inv) => sum + (inv.shares * inv.current_price), 0);
        
        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          const m = d.getMonth();
          const y = d.getFullYear();

          // Calculate cash at that point in time
          const cashAtTime = txData
            .filter(tx => {
              const txDate = new Date(tx.date);
              return txDate <= d;
            })
            .reduce((sum, tx) => sum + (tx.type === 'income' ? tx.amount : -Math.abs(tx.amount)), 0);

          history.push({
            name: months[m],
            value: cashAtTime + totalInvestmentValue
          });
        }
        setChartData(history);

        // Allocation
        const cash = txData.reduce((sum, tx) => sum + (tx.type === 'income' ? tx.amount : -Math.abs(tx.amount)), 0);
        setAllocationData([
          { name: 'Cash', value: Math.max(0, cash) },
          { name: 'Investments', value: totalInvestmentValue }
        ]);

        // Liabilities (Debt transactions)
        const debtMap = new Map();
        txData
          .filter(tx => tx.type === 'expense' && tx.category === 'Debt')
          .forEach(tx => {
            const current = debtMap.get(tx.description) || 0;
            debtMap.set(tx.description, current + Math.abs(tx.amount));
          });
        
        const liabilityList = Array.from(debtMap.entries()).map(([name, value]) => ({
          name,
          value,
          change: '0%' // Placeholder for change
        }));
        setLiabilities(liabilityList);
      }

      setLoading(false);
    }
    fetchData();
  }, [user]);

  const totalAssets = allocationData.reduce((sum, d) => sum + d.value, 0);
  const totalLiabilities = liabilities.reduce((sum, l) => sum + l.value, 0);
  const netWorth = totalAssets - totalLiabilities;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Net Worth Analytics</h2>
          <p className="text-slate-400">Track your total financial magnitude across all sectors.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
            <Plus size={18} />
            Add Asset/Liability
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Growth Trajectory</CardTitle>
            <CardDescription>Historical net worth data streams</CardDescription>
          </CardHeader>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis dataKey="name" stroke="#4B5563" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#4B5563" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `R${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '12px' }}
                  itemStyle={{ color: '#F3F4F6', fontSize: '12px' }}
                  formatter={(value: number) => [formatCurrency(value), 'Net Worth']}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#6366F1" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
            <CardDescription>Magnitude distribution</CardDescription>
          </CardHeader>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '12px' }}
                  itemStyle={{ color: '#F3F4F6', fontSize: '12px' }}
                  formatter={(value: number) => [formatCurrency(value), '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-3">
            {allocationData.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-sm p-2 bg-white/5 rounded-lg border border-white/5">
                <span className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                  <div className={cn("w-2 h-2 rounded-full", i === 0 ? "bg-primary" : "bg-secondary")} />
                  {item.name}
                </span>
                <span className="font-black text-white">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Asset Inventory</CardTitle>
              <CardDescription>Positive magnitude holdings</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-4">
            {investments.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">No assets detected</div>
            ) : investments.map((inv, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-border transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <Wallet size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-white">{inv.ticker}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{inv.shares} Shares @ {formatCurrency(inv.current_price)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-white font-mono">{formatCurrency(inv.shares * inv.current_price)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Liability Ledger</CardTitle>
              <CardDescription>Negative magnitude obligations</CardDescription>
            </div>
            <button className="p-2 text-slate-500 hover:text-error transition-colors">
              <Plus size={20} />
            </button>
          </CardHeader>
          <div className="space-y-4">
            {liabilities.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">No liabilities detected</div>
            ) : liabilities.map((liability, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-border transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center text-error border border-error/20">
                    <TrendingDown size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-white">{liability.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Updated recently</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-white font-mono">{formatCurrency(liability.value)}</p>
                  <p className="text-[10px] text-success font-bold">{liability.change}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
