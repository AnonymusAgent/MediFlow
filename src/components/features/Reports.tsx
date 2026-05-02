import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { formatCurrency, cn } from '@/lib/utils';
import { MOCK_DASHBOARD_STATS } from '@/constants/mockData';
import { Download, BarChart3, TrendingUp, DollarSign, Users } from 'lucide-react';

const monthlyData = [
  { month: 'Oct', charges: 138000, collections: 101000, ar: 95000 },
  { month: 'Nov', charges: 145000, collections: 108000, ar: 88000 },
  { month: 'Dec', charges: 162000, collections: 122000, ar: 92000 },
  { month: 'Jan', charges: 158000, collections: 118000, ar: 87000 },
  { month: 'Feb', charges: 171000, collections: 130000, ar: 90000 },
  { month: 'Mar', charges: 179000, collections: 136000, ar: 89000 },
  { month: 'Apr', charges: 187420, collections: 142380, ar: 89240 },
];

const claimsByPayer = [
  { name: 'Blue Cross', claims: 89, paid: 78, denied: 5, charges: 48500 },
  { name: 'Medicare', claims: 112, paid: 98, denied: 8, charges: 62300 },
  { name: 'Aetna', claims: 45, paid: 38, denied: 4, charges: 28900 },
  { name: 'United HC', claims: 67, paid: 60, denied: 4, charges: 41200 },
  { name: 'Cigna', claims: 38, paid: 34, denied: 2, charges: 22400 },
  { name: 'Humana', claims: 28, paid: 24, denied: 3, charges: 18100 },
];

const denialByReason = [
  { reason: 'Prior Auth Required', count: 8, color: '#ef4444' },
  { reason: 'Duplicate Claim', count: 5, color: '#f97316' },
  { reason: 'Not Covered', count: 4, color: '#f59e0b' },
  { reason: 'Eligibility Issue', count: 3, color: '#84cc16' },
  { reason: 'Missing Info', count: 3, color: '#06b6d4' },
];

type ReportType = 'financial' | 'payer' | 'denials' | 'ar';

export default function Reports() {
  const [activeReport, setActiveReport] = useState<ReportType>('financial');
  const stats = MOCK_DASHBOARD_STATS;

  const reports = [
    { id: 'financial' as ReportType, label: 'Financial Summary', icon: DollarSign },
    { id: 'payer' as ReportType, label: 'Payer Analysis', icon: BarChart3 },
    { id: 'denials' as ReportType, label: 'Denial Analysis', icon: TrendingUp },
    { id: 'ar' as ReportType, label: 'AR Aging Report', icon: Users },
  ];

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Financial dashboards and performance metrics</p>
        </div>
        <button className="btn-outline"><Download className="w-4 h-4" /> Export Report</button>
      </div>

      {/* Report Tabs */}
      <div className="flex gap-2 flex-wrap">
        {reports.map(r => {
          const Icon = r.icon;
          return (
            <button
              key={r.id}
              onClick={() => setActiveReport(r.id)}
              className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                activeReport === r.id
                  ? 'bg-[hsl(var(--primary))] text-white'
                  : 'bg-card border border-border hover:bg-muted'
              )}
            >
              <Icon className="w-4 h-4" /> {r.label}
            </button>
          );
        })}
      </div>

      {/* Financial Summary */}
      {activeReport === 'financial' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Charges YTD', value: formatCurrency(1040840), delta: '+12.3%', positive: true },
              { label: 'Collections YTD', value: formatCurrency(757280), delta: '+9.8%', positive: true },
              { label: 'Collection Rate', value: `${stats.collectionRate}%`, delta: '+1.2%', positive: true },
              { label: 'Denial Rate', value: `${stats.denialRate}%`, delta: '-0.8%', positive: true },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <p className="label-text">{s.label}</p>
                <p className="text-xl font-bold mt-1">{s.value}</p>
                <p className={cn('text-xs mt-1', s.positive ? 'text-emerald-600' : 'text-red-500')}>{s.delta} vs last year</p>
              </div>
            ))}
          </div>

          <div className="stat-card">
            <h3 className="section-title mb-4">Monthly Charges vs Collections (7 Months)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 93%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Legend />
                <Bar dataKey="charges" name="Charges" fill="hsl(213 72% 22%)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="collections" name="Collections" fill="hsl(172 66% 42%)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="stat-card">
            <h3 className="section-title mb-4">AR Trend (7 Months)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 93%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Line type="monotone" dataKey="ar" name="Total AR" stroke="hsl(0 78% 55%)" strokeWidth={2} dot={{ fill: 'hsl(0 78% 55%)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Payer Analysis */}
      {activeReport === 'payer' && (
        <div className="space-y-5">
          <div className="stat-card">
            <h3 className="section-title mb-4">Claims by Payer</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={claimsByPayer}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 93%)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="claims" name="Total Claims" fill="hsl(213 72% 22%)" />
                <Bar dataKey="paid" name="Paid" fill="hsl(172 66% 42%)" />
                <Bar dataKey="denied" name="Denied" fill="hsl(0 78% 55%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {['Payer', 'Total Claims', 'Paid', 'Denied', 'Denial Rate', 'Total Charges'].map(h => (
                    <th key={h} className="text-left px-4 py-3 label-text">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {claimsByPayer.map(row => (
                  <tr key={row.name} className="table-row-hover">
                    <td className="px-4 py-3 font-medium text-sm">{row.name}</td>
                    <td className="px-4 py-3 text-sm">{row.claims}</td>
                    <td className="px-4 py-3 text-sm text-emerald-600">{row.paid}</td>
                    <td className="px-4 py-3 text-sm text-red-600">{row.denied}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={cn('font-semibold', ((row.denied / row.claims) * 100) > 10 ? 'text-red-600' : 'text-yellow-600')}>
                        {((row.denied / row.claims) * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{formatCurrency(row.charges)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Denial Analysis */}
      {activeReport === 'denials' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="stat-card">
            <h3 className="section-title mb-4">Denials by Reason</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={denialByReason} cx="50%" cy="50%" outerRadius={90} dataKey="count" label={({ reason, percent }) => `${((percent || 0) * 100).toFixed(0)}%`}>
                  {denialByReason.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {denialByReason.map(d => (
                <div key={d.reason} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                    {d.reason}
                  </span>
                  <span className="font-semibold">{d.count} claims</span>
                </div>
              ))}
            </div>
          </div>

          <div className="stat-card">
            <h3 className="section-title mb-4">Key Metrics</h3>
            <div className="space-y-4">
              {[
                { label: 'Total Denials This Month', value: '23', desc: 'Out of 312 claims submitted', color: 'text-red-600' },
                { label: 'Denial Rate', value: `${stats.denialRate}%`, desc: 'Industry benchmark: < 10%', color: 'text-orange-600' },
                { label: 'Appeals Filed', value: '14', desc: '61% appeal rate on denials', color: 'text-blue-600' },
                { label: 'Appeals Won', value: '9', desc: '64% appeal success rate', color: 'text-emerald-600' },
                { label: 'Revenue Recovered', value: '$12,840', desc: 'From successful appeals', color: 'text-emerald-600' },
              ].map(m => (
                <div key={m.label} className="flex items-start justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium">{m.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
                  </div>
                  <span className={cn('text-xl font-bold', m.color)}>{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AR Aging */}
      {activeReport === 'ar' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: '0-30 Days', value: stats.ar30, color: 'border-emerald-400 bg-emerald-50' },
              { label: '31-60 Days', value: stats.ar60, color: 'border-yellow-400 bg-yellow-50' },
              { label: '61-90 Days', value: stats.ar90, color: 'border-orange-400 bg-orange-50' },
              { label: '91-120 Days', value: stats.ar120plus * 0.7, color: 'border-red-400 bg-red-50' },
              { label: '120+ Days', value: stats.ar120plus * 0.3, color: 'border-red-700 bg-red-100' },
            ].map(b => (
              <div key={b.label} className={cn('border-l-4 rounded-lg p-4', b.color)}>
                <p className="text-xs font-medium text-muted-foreground">{b.label}</p>
                <p className="text-lg font-bold mt-1">{formatCurrency(b.value)}</p>
              </div>
            ))}
          </div>

          <div className="stat-card">
            <h3 className="section-title mb-4">AR by Provider</h3>
            <div className="space-y-3">
              {[
                { provider: 'Dr. Sarah Mitchell', ar: 48200, claims: 28 },
                { provider: 'Dr. Michael Torres', ar: 41040, claims: 22 },
              ].map(p => (
                <div key={p.provider} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{p.provider}</p>
                    <p className="text-xs text-muted-foreground">{p.claims} open claims</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{formatCurrency(p.ar)}</p>
                    <div className="w-32 bg-muted rounded-full h-1.5 mt-1">
                      <div
                        className="h-1.5 rounded-full bg-[hsl(var(--teal))]"
                        style={{ width: `${(p.ar / stats.totalAR) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
