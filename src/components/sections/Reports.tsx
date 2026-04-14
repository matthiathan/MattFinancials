import React from 'react';
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
import { formatCurrency } from '../../lib/utils';

const cashFlowData = [
  { name: 'Jan', inflow: 40000, outflow: 24000 },
  { name: 'Feb', inflow: 30000, outflow: 13980 },
  { name: 'Mar', inflow: 20000, outflow: 98000 },
  { name: 'Apr', inflow: 27800, outflow: 39080 },
  { name: 'May', inflow: 18900, outflow: 48000 },
  { name: 'Jun', inflow: 23900, outflow: 38000 },
  { name: 'Jul', inflow: 34900, outflow: 43000 },
];

const savingsRateData = [
  { name: 'Jan', rate: 40 },
  { name: 'Feb', rate: 53 },
  { name: 'Mar', rate: -20 },
  { name: 'Apr', rate: 35 },
  { name: 'May', rate: 42 },
  { name: 'Jun', rate: 49 },
  { name: 'Jul', rate: 45 },
];

const expenseBreakdown = [
  { name: 'Jan', Housing: 20000, Food: 6000, Transport: 4000, Other: 5000 },
  { name: 'Feb', Housing: 20000, Food: 5500, Transport: 3800, Other: 4500 },
  { name: 'Mar', Housing: 20000, Food: 7200, Transport: 4100, Other: 6000 },
  { name: 'Apr', Housing: 20000, Food: 5800, Transport: 3900, Other: 5200 },
  { name: 'May', Housing: 20000, Food: 6100, Transport: 4000, Other: 4800 },
  { name: 'Jun', Housing: 20000, Food: 6300, Transport: 4200, Other: 5500 },
];

export function Reports() {
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
                <Bar dataKey="Other" stackId="a" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
