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
import { formatCurrency } from '../../lib/utils';

const lineData = [
  { name: 'Jul', value: 1100000 },
  { name: 'Aug', value: 1125000 },
  { name: 'Sep', value: 1150000 },
  { name: 'Oct', value: 1180000 },
  { name: 'Nov', value: 1210000 },
  { name: 'Dec', value: 1245000 },
];

const pieData = [
  { name: 'Assets', value: 1500000 },
  { name: 'Liabilities', value: 255000 },
];

const COLORS = ['#6366F1', '#EF4444'];

export function NetWorth() {
  const { user } = useAuth();
  const [assets, setAssets] = useState<any[]>([]);
  const [liabilities, setLiabilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      setLoading(false);
    }
    fetchData();
  }, [user]);

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
              <AreaChart data={lineData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis dataKey="name" stroke="#4B5563" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#4B5563" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `R${value/1000000}M`} />
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
                  itemStyle={{ color: '#F3F4F6', fontSize: '12px' }}
                  formatter={(value: number) => [formatCurrency(value), '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between items-center text-sm p-2 bg-white/5 rounded-lg border border-white/5">
              <span className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Assets
              </span>
              <span className="font-black text-white">{formatCurrency(1500000)}</span>
            </div>
            <div className="flex justify-between items-center text-sm p-2 bg-white/5 rounded-lg border border-white/5">
              <span className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                <div className="w-2 h-2 rounded-full bg-error" />
                Liabilities
              </span>
              <span className="font-black text-white">{formatCurrency(255000)}</span>
            </div>
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
            <button className="p-2 text-slate-500 hover:text-primary transition-colors">
              <Plus size={20} />
            </button>
          </CardHeader>
          <div className="space-y-4">
            {[
              { name: 'Checking Account', value: 125000, change: '+2.1%' },
              { name: 'Savings Account', value: 450000, change: '+0.5%' },
              { name: 'Stock Portfolio', value: 850000, change: '+5.4%' },
              { name: 'Real Estate', value: 75000, change: '0.0%' },
            ].map((asset, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-border transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <Wallet size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-white">{asset.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Updated 2 days ago</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-white font-mono">{formatCurrency(asset.value)}</p>
                  <p className="text-[10px] text-success font-bold">{asset.change}</p>
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
            {[
              { name: 'Credit Card', value: 25000, change: '-12.4%' },
              { name: 'Student Loan', value: 150000, change: '-1.1%' },
              { name: 'Car Loan', value: 80000, change: '-2.5%' },
            ].map((liability, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-border transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center text-error border border-error/20">
                    <TrendingDown size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-white">{liability.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Updated 1 day ago</p>
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
