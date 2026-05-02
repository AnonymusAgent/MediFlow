import {
  Users, Calendar, FileText, DollarSign, TrendingUp,
  TrendingDown, AlertTriangle, CheckCircle, Clock, Activity,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { MOCK_DASHBOARD_STATS, MOCK_CLAIMS, MOCK_APPOINTMENTS, MOCK_AR } from '@/constants/mockData';
import { formatCurrency, getClaimStatusColor, getAppointmentStatusColor } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const collectionData = [
  { month: 'Nov', charges: 145000, collections: 108000 },
  { month: 'Dec', charges: 162000, collections: 122000 },
  { month: 'Jan', charges: 158000, collections: 118000 },
  { month: 'Feb', charges: 171000, collections: 130000 },
  { month: 'Mar', charges: 179000, collections: 136000 },
  { month: 'Apr', charges: 187420, collections: 142380 },
];

const arAgingData = [
  { name: '0-30 days', value: 34120, color: '#10b981' },
  { name: '31-60 days', value: 28450, color: '#f59e0b' },
  { name: '61-90 days', value: 15670, color: '#f97316' },
  { name: '91-120 days', value: 8000, color: '#ef4444' },
  { name: '120+ days', value: 3000, color: '#991b1b' },
];

const denialData = [
  { week: 'W1', denials: 8 },
  { week: 'W2', denials: 5 },
  { week: 'W3', denials: 12 },
  { week: 'W4', denials: 6 },
];

export default function Dashboard() {
  const stats = MOCK_DASHBOARD_STATS;
  const todayAppts = MOCK_APPOINTMENTS.filter(a => a.date === '2026-04-28');

  return (
    <div className="p-6 space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Practice Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Revenue Cycle Overview — April 2026</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full font-medium">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Live Data
          </span>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="label-text">Total Patients</p>
              <p className="text-2xl font-bold mt-1">{stats.totalPatients.toLocaleString()}</p>
              <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> +{stats.newPatientsThisMonth} this month
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="label-text">Charges (MTD)</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(stats.totalChargesThisMonth)}</p>
              <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> +4.7% vs last month
              </p>
            </div>
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="label-text">Collections (MTD)</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(stats.totalCollectionsThisMonth)}</p>
              <p className="text-xs text-emerald-600 mt-1">
                {stats.collectionRate}% collection rate
              </p>
            </div>
            <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-teal-600" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="label-text">Total AR</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(stats.totalAR)}</p>
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <ArrowDownRight className="w-3 h-3" /> {stats.ar120plus > 0 ? formatCurrency(stats.ar120plus) : '0'} 120+ days
              </p>
            </div>
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <Calendar className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Today's Appts</p>
            <p className="text-xl font-bold">{stats.appointmentsToday}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-yellow-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <Clock className="w-4 h-4 text-yellow-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Pending Claims</p>
            <p className="text-xl font-bold">{stats.claimsPending}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Denial Rate</p>
            <p className="text-xl font-bold text-red-500">{stats.denialRate}%</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Clean Claim Rate</p>
            <p className="text-xl font-bold text-emerald-600">{stats.cleanClaimRate}%</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Collections Chart */}
        <div className="lg:col-span-2 stat-card">
          <h3 className="section-title mb-4">Charges vs Collections (6 Months)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={collectionData} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 93%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="charges" fill="hsl(213 72% 22%)" radius={[3, 3, 0, 0]} name="Charges" />
              <Bar dataKey="collections" fill="hsl(172 66% 42%)" radius={[3, 3, 0, 0]} name="Collections" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-6 mt-2 justify-end">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-3 h-2 rounded bg-[hsl(213,72%,22%)] inline-block"></span>Charges</span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-3 h-2 rounded bg-[hsl(172,66%,42%)] inline-block"></span>Collections</span>
          </div>
        </div>

        {/* AR Aging Donut */}
        <div className="stat-card">
          <h3 className="section-title mb-4">AR Aging Breakdown</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={arAgingData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={2}>
                {arAgingData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {arAgingData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: item.color }}></span>
                  <span className="text-muted-foreground">{item.name}</span>
                </span>
                <span className="font-medium">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Today's Schedule + Recent Claims */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Today's Appointments */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Today's Schedule</h3>
            <span className="text-xs text-muted-foreground">{todayAppts.length} appointments</span>
          </div>
          <div className="space-y-2">
            {todayAppts.slice(0, 5).map((appt) => (
              <div key={appt.id} className="flex items-center gap-3 p-2.5 rounded-md bg-muted/30 hover:bg-muted/60 transition-colors cursor-pointer">
                <div className="text-center w-12 flex-shrink-0">
                  <p className="text-xs font-bold text-[hsl(var(--primary))]">{appt.time}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{appt.patientName}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{appt.type} • {appt.reason}</p>
                </div>
                <span className={`badge-status ${getAppointmentStatusColor(appt.status)} flex-shrink-0`}>
                  {appt.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Claims */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Recent Claims Activity</h3>
            <span className="text-xs text-muted-foreground">{MOCK_CLAIMS.length} claims</span>
          </div>
          <div className="space-y-2">
            {MOCK_CLAIMS.slice(0, 5).map((claim) => (
              <div key={claim.id} className="flex items-center gap-3 p-2.5 rounded-md hover:bg-muted/30 transition-colors cursor-pointer">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium truncate">{claim.patientName}</p>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">{claim.claimNumber.split('-').slice(-1)}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{claim.payerName}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-semibold">{formatCurrency(claim.totalCharges)}</p>
                  <span className={`badge-status border ${getClaimStatusColor(claim.status)} mt-0.5`}>
                    {claim.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
