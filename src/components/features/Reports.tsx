import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, ComposedChart, Area
} from 'recharts';
import { formatCurrency, cn } from '@/lib/utils';
import { MOCK_DASHBOARD_STATS } from '@/constants/mockData';
import { Download, BarChart3, TrendingUp, DollarSign, Users, Activity } from 'lucide-react';

const monthlyData = [
  { month: 'Oct', charges: 138000, collections: 101000, ar: 95000, prevCollections: 94000 },
  { month: 'Nov', charges: 145000, collections: 108000, ar: 88000, prevCollections: 99000 },
  { month: 'Dec', charges: 162000, collections: 122000, ar: 92000, prevCollections: 110000 },
  { month: 'Jan', charges: 158000, collections: 118000, ar: 87000, prevCollections: 112000 },
  { month: 'Feb', charges: 171000, collections: 130000, ar: 90000, prevCollections: 119000 },
  { month: 'Mar', charges: 179000, collections: 136000, ar: 89000, prevCollections: 125000 },
  { month: 'Apr', charges: 187420, collections: 142380, ar: 89240, prevCollections: 131000 },
];

// 90-day daily collection trend data (last 90 days)
const dailyTrend = Array.from({ length: 90 }, (_, i) => {
  const date = new Date('2026-04-28');
  date.setDate(date.getDate() - (89 - i));
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const base = isWeekend ? 0 : 4500;
  const current = base + (isWeekend ? 0 : Math.sin(i * 0.3) * 1200 + Math.random() * 800);
  const prior = base + (isWeekend ? 0 : Math.sin(i * 0.3) * 900 + Math.random() * 600);
  return {
    day: i + 1,
    label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    current: Math.round(current),
    prior: Math.round(prior),
  };
}).filter((_, i) => i % 3 === 0); // Sample every 3rd day for readability

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

// Provider AR drill-down data
const providerARData = [
  {
    provider: 'Dr. Sarah Mitchell',
    specialty: 'Internal Medicine',
    totalAR: 48200,
    ar30: 18400,
    ar60: 16800,
    ar90: 9200,
    ar120: 3800,
    claims: 28,
    avgDaysBilled: 42,
    collectionRate: 76.2,
  },
  {
    provider: 'Dr. Michael Torres',
    specialty: 'Cardiology',
    totalAR: 41040,
    ar30: 15720,
    ar60: 11650,
    ar90: 8470,
    ar120: 5200,
    claims: 22,
    avgDaysBilled: 51,
    collectionRate: 73.8,
  },
];

// Payer AR heat-map data
const payerARHeatmap = [
  { payer: 'Blue Cross', ar30: 12400, ar60: 8200, ar90: 3800, ar120: 1200 },
  { payer: 'Medicare', ar30: 9800, ar60: 10400, ar90: 5200, ar120: 3600 },
  { payer: 'Aetna', ar30: 6200, ar60: 4100, ar90: 2800, ar120: 1000 },
  { payer: 'United HC', ar30: 8100, ar60: 5200, ar90: 2400, ar120: 800 },
  { payer: 'Cigna', ar30: 4200, ar60: 2800, ar90: 1800, ar120: 400 },
  { payer: 'Humana', ar30: 2400, ar60: 2000, ar90: 1200, ar120: 800 },
];

function getHeatColor(value: number, max: number): string {
  const pct = value / max;
  if (pct > 0.7) return 'bg-red-500 text-white';
  if (pct > 0.4) return 'bg-orange-400 text-white';
  if (pct > 0.2) return 'bg-yellow-300 text-gray-800';
  if (pct > 0.05) return 'bg-green-200 text-gray-800';
  return 'bg-green-50 text-gray-600';
}

type ReportType = 'financial' | 'payer' | 'denials' | 'ar';

export default function Reports() {
  const [activeReport, setActiveReport] = useState<ReportType>('financial');
  const [arView, setArView] = useState<'overview' | 'provider' | 'heatmap' | 'trend'>('overview');
  const stats = MOCK_DASHBOARD_STATS;

  const reports = [
    { id: 'financial' as ReportType, label: 'Financial Summary', icon: DollarSign },
    { id: 'payer' as ReportType, label: 'Payer Analysis', icon: BarChart3 },
    { id: 'denials' as ReportType, label: 'Denial Analysis', icon: TrendingUp },
    { id: 'ar' as ReportType, label: 'AR Analytics', icon: Activity },
  ];

  const maxHeatValue = Math.max(...payerARHeatmap.flatMap(r => [r.ar30, r.ar60, r.ar90, r.ar120]));

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
            <button key={r.id} onClick={() => setActiveReport(r.id)}
              className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                activeReport === r.id ? 'bg-[hsl(var(--primary))] text-white' : 'bg-card border border-border hover:bg-muted'
              )}>
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
                <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
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
                <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
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
                <Pie data={denialByReason} cx="50%" cy="50%" outerRadius={90} dataKey="count"
                  label={({ percent }) => `${((percent || 0) * 100).toFixed(0)}%`}>
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

      {/* Advanced AR Analytics */}
      {activeReport === 'ar' && (
        <div className="space-y-5">
          {/* AR Sub-tabs */}
          <div className="flex gap-2 flex-wrap">
            {[
              { id: 'overview', label: 'AR Overview' },
              { id: 'provider', label: 'Provider Drill-Down' },
              { id: 'heatmap', label: 'Payer Heat Map' },
              { id: 'trend', label: '90-Day Trend' },
            ].map(t => (
              <button key={t.id} onClick={() => setArView(t.id as typeof arView)}
                className={cn('px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                  arView === t.id ? 'bg-[hsl(var(--teal))] text-white' : 'bg-muted hover:bg-muted/70'
                )}>
                {t.label}
              </button>
            ))}
          </div>

          {/* AR Overview */}
          {arView === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { label: 'Total AR', value: formatCurrency(stats.totalAR), color: 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5', textColor: 'text-[hsl(var(--primary))]' },
                  { label: '0-30 Days', value: formatCurrency(stats.ar30), color: 'border-emerald-400 bg-emerald-50', textColor: 'text-emerald-700' },
                  { label: '31-60 Days', value: formatCurrency(stats.ar60), color: 'border-yellow-400 bg-yellow-50', textColor: 'text-yellow-700' },
                  { label: '61-90 Days', value: formatCurrency(stats.ar90), color: 'border-orange-400 bg-orange-50', textColor: 'text-orange-700' },
                  { label: '120+ Days', value: formatCurrency(stats.ar120plus), color: 'border-red-500 bg-red-50', textColor: 'text-red-700' },
                ].map(b => (
                  <div key={b.label} className={cn('border-l-4 rounded-lg p-4', b.color)}>
                    <p className="text-xs font-medium text-muted-foreground">{b.label}</p>
                    <p className={cn('text-lg font-bold mt-1', b.textColor)}>{b.value}</p>
                    <div className="w-full bg-white/60 rounded-full h-1 mt-2">
                      <div className={cn('h-1 rounded-full', b.textColor.replace('text-', 'bg-'))}
                        style={{ width: `${(parseFloat(b.value.replace(/[$,]/g, '')) / stats.totalAR) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="stat-card">
                <h3 className="section-title mb-4">AR Aging Distribution</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={[
                    { bucket: '0-30 Days', amount: stats.ar30, pct: ((stats.ar30 / stats.totalAR) * 100).toFixed(1) },
                    { bucket: '31-60 Days', amount: stats.ar60, pct: ((stats.ar60 / stats.totalAR) * 100).toFixed(1) },
                    { bucket: '61-90 Days', amount: stats.ar90, pct: ((stats.ar90 / stats.totalAR) * 100).toFixed(1) },
                    { bucket: '91-120 Days', amount: stats.ar120plus * 0.65, pct: (((stats.ar120plus * 0.65) / stats.totalAR) * 100).toFixed(1) },
                    { bucket: '120+ Days', amount: stats.ar120plus * 0.35, pct: (((stats.ar120plus * 0.35) / stats.totalAR) * 100).toFixed(1) },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Bar dataKey="amount" name="AR Balance" fill="hsl(213 72% 22%)" radius={[4, 4, 0, 0]}>
                      {[0, 1, 2, 3, 4].map(i => (
                        <Cell key={i} fill={['#10b981', '#f59e0b', '#f97316', '#ef4444', '#991b1b'][i]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Provider Drill-Down */}
          {arView === 'provider' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {providerARData.map(p => (
                  <div key={p.provider} className="stat-card">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-bold">{p.provider}</p>
                        <p className="text-xs text-muted-foreground">{p.specialty}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[hsl(var(--primary))]">{formatCurrency(p.totalAR)}</p>
                        <p className="text-xs text-muted-foreground">{p.claims} open claims</p>
                      </div>
                    </div>

                    {/* AR Aging Breakdown */}
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {[
                        { label: '0-30d', value: p.ar30, color: 'bg-emerald-100 text-emerald-700' },
                        { label: '31-60d', value: p.ar60, color: 'bg-yellow-100 text-yellow-700' },
                        { label: '61-90d', value: p.ar90, color: 'bg-orange-100 text-orange-700' },
                        { label: '120+d', value: p.ar120, color: 'bg-red-100 text-red-700' },
                      ].map(b => (
                        <div key={b.label} className={cn('rounded-md p-2 text-center', b.color)}>
                          <p className="text-[10px] font-medium">{b.label}</p>
                          <p className="text-xs font-bold mt-0.5">${(b.value / 1000).toFixed(1)}k</p>
                        </div>
                      ))}
                    </div>

                    {/* Collection Rate Bar */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Collection Rate</span>
                        <span className={cn('font-bold', p.collectionRate >= 75 ? 'text-emerald-600' : 'text-orange-600')}>{p.collectionRate}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className={cn('h-2 rounded-full', p.collectionRate >= 75 ? 'bg-emerald-500' : 'bg-orange-500')}
                          style={{ width: `${p.collectionRate}%` }} />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">Avg days to bill: {p.avgDaysBilled}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Provider AR Bar Chart */}
              <div className="stat-card">
                <h3 className="section-title mb-4">Provider AR by Aging Bucket</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={providerARData.map(p => ({ name: p.provider.split(' ').slice(-1)[0], '0-30': p.ar30, '31-60': p.ar60, '61-90': p.ar90, '120+': p.ar120 }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Legend />
                    <Bar dataKey="0-30" name="0-30 Days" fill="#10b981" stackId="a" />
                    <Bar dataKey="31-60" name="31-60 Days" fill="#f59e0b" stackId="a" />
                    <Bar dataKey="61-90" name="61-90 Days" fill="#f97316" stackId="a" />
                    <Bar dataKey="120+" name="120+ Days" fill="#ef4444" stackId="a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Payer Heat Map */}
          {arView === 'heatmap' && (
            <div className="stat-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="section-title">Payer AR Performance Heat Map</h3>
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-100 border border-green-300"></span>Low</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-300"></span>Med</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-400"></span>High</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500"></span>Critical</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-4">AR balance by payer and aging bucket — darker = higher outstanding balance requiring action</p>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left px-3 py-2 label-text w-36">Payer</th>
                      {['0-30 Days', '31-60 Days', '61-90 Days', '120+ Days'].map(h => (
                        <th key={h} className="text-center px-3 py-2 label-text">{h}</th>
                      ))}
                      <th className="text-right px-3 py-2 label-text">Total AR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {payerARHeatmap.map(row => {
                      const total = row.ar30 + row.ar60 + row.ar90 + row.ar120;
                      return (
                        <tr key={row.payer}>
                          <td className="px-3 py-3 font-medium text-sm">{row.payer}</td>
                          {[row.ar30, row.ar60, row.ar90, row.ar120].map((val, i) => (
                            <td key={i} className="px-3 py-3 text-center">
                              <span className={cn('inline-block px-3 py-1.5 rounded-md text-xs font-bold w-20 text-center', getHeatColor(val, maxHeatValue))}>
                                {formatCurrency(val)}
                              </span>
                            </td>
                          ))}
                          <td className="px-3 py-3 text-right font-bold text-sm">{formatCurrency(total)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border bg-muted/30">
                      <td className="px-3 py-2 text-xs font-bold uppercase text-muted-foreground">Totals</td>
                      {['ar30', 'ar60', 'ar90', 'ar120'].map(key => (
                        <td key={key} className="px-3 py-2 text-center text-sm font-bold">
                          {formatCurrency(payerARHeatmap.reduce((s, r) => s + r[key as keyof typeof r], 0) as number)}
                        </td>
                      ))}
                      <td className="px-3 py-2 text-right text-sm font-bold text-[hsl(var(--primary))]">
                        {formatCurrency(payerARHeatmap.reduce((s, r) => s + r.ar30 + r.ar60 + r.ar90 + r.ar120, 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* 90-Day Collection Trend */}
          {arView === 'trend' && (
            <div className="space-y-4">
              <div className="stat-card">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="section-title">90-Day Collection Trend</h3>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-[hsl(var(--teal))] rounded"></span>Current Period</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-muted-foreground/40 rounded border-dashed"></span>Prior Period</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-4">Daily collections — current 90 days vs same period prior year</p>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={dailyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 93%)" />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={4} />
                    <YAxis tickFormatter={v => `$${(v / 1000).toFixed(1)}k`} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Area type="monotone" dataKey="current" name="Current Period" fill="hsl(172 66% 42%)" fillOpacity={0.15} stroke="hsl(172 66% 42%)" strokeWidth={2} />
                    <Line type="monotone" dataKey="prior" name="Prior Period" stroke="hsl(215 16% 65%)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* 90-day KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Collections (90d)', value: formatCurrency(dailyTrend.reduce((s, d) => s + d.current, 0)), delta: '+8.9%', positive: true },
                  { label: 'Prior Period (90d)', value: formatCurrency(dailyTrend.reduce((s, d) => s + d.prior, 0)), delta: 'Baseline', positive: true },
                  { label: 'Avg Daily Collection', value: formatCurrency(dailyTrend.filter(d => d.current > 0).reduce((s, d) => s + d.current, 0) / dailyTrend.filter(d => d.current > 0).length), delta: '+7.2% YoY', positive: true },
                  { label: 'Peak Collection Day', value: formatCurrency(Math.max(...dailyTrend.map(d => d.current))), delta: 'This period', positive: true },
                ].map(s => (
                  <div key={s.label} className="stat-card">
                    <p className="label-text">{s.label}</p>
                    <p className="text-lg font-bold mt-1">{s.value}</p>
                    <p className={cn('text-xs mt-1', s.positive ? 'text-emerald-600' : 'text-red-500')}>{s.delta}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
