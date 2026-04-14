import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../lib/utils';

export function Reports() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [cashFlowData, setCashFlowData] = useState<any[]>([]);
  const [savingsRateData, setSavingsRateData] = useState<any[]>([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      setLoading(true);

      const { data: allTx } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id);

      if (allTx) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const last6Months = [];
        
        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          const m = d.getMonth();
          const y = d.getFullYear();
          const monthName = months[m];

          // Cash Flow
          const inflow = allTx
            .filter(tx => {
              const date = new Date(tx.date);
              return date.getMonth() === m && date.getFullYear() === y && tx.type === 'income';
            })
            .reduce((sum, tx) => sum + tx.amount, 0);

          const outflow = allTx
            .filter(tx => {
              const date = new Date(tx.date);
              return date.getMonth() === m && date.getFullYear() === y && tx.type === 'expense';
            })
            .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

          last6Months.push({
            name: monthName,
            inflow,
            outflow,
            rate: inflow > 0 ? Math.max(0, ((inflow - outflow) / inflow) * 100) : 0
          });

          // Expense Breakdown
          const categories = ['Housing', 'Food', 'Transport', 'Utilities', 'Entertainment', 'Healthcare', 'Shopping', 'Other'];
          const breakdown: any = { name: monthName };
          categories.forEach(cat => {
            breakdown[cat] = allTx
              .filter(tx => {
                const date = new Date(tx.date);
                return date.getMonth() === m && date.getFullYear() === y && tx.type === 'expense' && (tx.category === cat || (cat === 'Other' && !categories.includes(tx.category)));
              })
              .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
          });
          
          // Add to breakdown list
          // We'll update state later
        }

        setCashFlowData(last6Months.map(d => ({ name: d.name, inflow: d.inflow, outflow: d.outflow })));
        setSavingsRateData(last6Months.map(d => ({ name: d.name, rate: d.rate })));
        
        // Re-calculate breakdown for state
        const breakdownData = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          const m = d.getMonth();
          const y = d.getFullYear();
          const monthName = months[m];
          const categories = ['Housing', 'Food', 'Transport', 'Utilities', 'Entertainment', 'Healthcare', 'Shopping'];
          const breakdown: any = { name: monthName };
          let otherSum = 0;
          
          allTx
            .filter(tx => {
              const date = new Date(tx.date);
              return date.getMonth() === m && date.getFullYear() === y && tx.type === 'expense';
            })
            .forEach(tx => {
              if (categories.includes(tx.category)) {
                breakdown[tx.category] = (breakdown[tx.category] || 0) + Math.abs(tx.amount);
              } else {
                otherSum += Math.abs(tx.amount);
              }
            });
          breakdown['Other'] = otherSum;
          breakdownData.push(breakdown);
        }
        setExpenseBreakdown(breakdownData);
      }

      setLoading(false);
    }
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }
  return (
    <div className="space-y-8 pb-10">
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">Financial Intelligence Reports</h2>
        <p className="text-slate-400">Deep dive into your financial trends and performance magnitude.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cash Flow Magnitude</CardTitle>
            <CardDescription>Monthly inflow vs outflow data streams</CardDescription>
          </CardHeader>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowData}>
                <defs>
                  <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis dataKey="name" stroke="#4B5563" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#4B5563" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `R${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px' }}
                  formatter={(value: number) => [formatCurrency(value), '']}
                />
                <Area type="monotone" dataKey="inflow" stroke="#6366F1" fillOpacity={1} fill="url(#colorInflow)" strokeWidth={3} />
                <Area type="monotone" dataKey="outflow" stroke="#EF4444" fillOpacity={1} fill="url(#colorOutflow)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Savings Efficiency</CardTitle>
            <CardDescription>Percentage of income saved per cycle</CardDescription>
          </CardHeader>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={savingsRateData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis dataKey="name" stroke="#4B5563" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#4B5563" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#10B981" 
                  strokeWidth={3} 
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4, stroke: '#111827' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Expense Sector Breakdown</CardTitle>
            <CardDescription>Stacked magnitude of monthly expenditures</CardDescription>
          </CardHeader>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expenseBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis dataKey="name" stroke="#4B5563" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#4B5563" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `R${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px' }}
                  formatter={(value: number) => [formatCurrency(value), '']}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                <Bar dataKey="Housing" stackId="a" fill="#6366F1" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Food" stackId="a" fill="#22D3EE" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Transport" stackId="a" fill="#EF4444" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Utilities" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Entertainment" stackId="a" fill="#F59E0B" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Other" stackId="a" fill="#4B5563" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
