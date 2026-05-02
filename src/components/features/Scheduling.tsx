import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, User, MapPin } from 'lucide-react';
import { MOCK_APPOINTMENTS } from '@/constants/mockData';
import { Appointment } from '@/types';
import { getAppointmentStatusColor, cn } from '@/lib/utils';

const PROVIDERS = ['All Providers', 'Dr. Sarah Mitchell', 'Dr. Michael Torres'];
const TIME_SLOTS = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'];

const APPOINTMENT_COLORS: Record<string, string> = {
  'New Patient': 'bg-blue-100 border-blue-400 text-blue-800',
  'Follow-up': 'bg-teal-100 border-teal-400 text-teal-800',
  'Consultation': 'bg-purple-100 border-purple-400 text-purple-800',
  'Procedure': 'bg-orange-100 border-orange-400 text-orange-800',
  'Telehealth': 'bg-indigo-100 border-indigo-400 text-indigo-800',
};

export default function Scheduling() {
  const [selectedDate, setSelectedDate] = useState('2026-04-28');
  const [selectedProvider, setSelectedProvider] = useState('All Providers');
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [view, setView] = useState<'day' | 'week' | 'list'>('day');

  const filtered = MOCK_APPOINTMENTS.filter(a => {
    const matchDate = a.date === selectedDate;
    const matchProvider = selectedProvider === 'All Providers' || a.providerName === selectedProvider;
    return matchDate && matchProvider;
  });

  const navigateDate = (dir: number) => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + dir);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const formatDisplayDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    });
  };

  const getApptForSlot = (time: string) => filtered.find(a => a.time === time);

  const statusCounts = {
    total: filtered.length,
    confirmed: filtered.filter(a => a.status === 'Confirmed').length,
    checkedIn: filtered.filter(a => a.status === 'Checked In').length,
    inProgress: filtered.filter(a => a.status === 'In Progress').length,
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Scheduling</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Multi-provider appointment calendar</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> New Appointment
        </button>
      </div>

      {/* Day Summary Badges */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="bg-card border border-border rounded-lg px-4 py-2.5 flex items-center gap-3">
          <span className="text-2xl font-bold text-[hsl(var(--primary))]">{statusCounts.total}</span>
          <span className="text-sm text-muted-foreground">Total</span>
        </div>
        {[
          { label: 'Confirmed', value: statusCounts.confirmed, color: 'text-blue-600 bg-blue-50' },
          { label: 'Checked In', value: statusCounts.checkedIn, color: 'text-teal-600 bg-teal-50' },
          { label: 'In Progress', value: statusCounts.inProgress, color: 'text-purple-600 bg-purple-50' },
        ].map(s => (
          <div key={s.label} className={cn('px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2', s.color)}>
            <span className="font-bold">{s.value}</span> {s.label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Calendar Controls */}
        <div className="lg:col-span-1 space-y-4">
          {/* Date Nav */}
          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => navigateDate(-1)} className="w-8 h-8 rounded-md hover:bg-muted flex items-center justify-center">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="text-center">
                <p className="font-semibold text-sm">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' })}
                </p>
              </div>
              <button onClick={() => navigateDate(1)} className="w-8 h-8 rounded-md hover:bg-muted flex items-center justify-center">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => setSelectedDate('2026-04-28')}
              className="w-full text-xs text-[hsl(var(--teal))] hover:underline"
            >
              Go to Today
            </button>
          </div>

          {/* Provider Filter */}
          <div className="stat-card">
            <p className="label-text mb-2">Filter by Provider</p>
            <div className="space-y-1">
              {PROVIDERS.map(p => (
                <button
                  key={p}
                  onClick={() => setSelectedProvider(p)}
                  className={cn('w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                    selectedProvider === p ? 'bg-[hsl(var(--primary))] text-white' : 'hover:bg-muted'
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Appointment Type Legend */}
          <div className="stat-card">
            <p className="label-text mb-2">Appointment Types</p>
            <div className="space-y-1.5">
              {Object.entries(APPOINTMENT_COLORS).map(([type, color]) => (
                <div key={type} className="flex items-center gap-2">
                  <div className={cn('w-3 h-3 rounded border', color)}></div>
                  <span className="text-xs">{type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Day View */}
        <div className="lg:col-span-3">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title">{formatDisplayDate(selectedDate)}</h3>
              <div className="flex gap-1">
                {(['day', 'list'] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={cn('px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors',
                      view === v ? 'bg-[hsl(var(--primary))] text-white' : 'bg-muted hover:bg-muted/70'
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {view === 'day' && (
              <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
                {TIME_SLOTS.map(time => {
                  const appt = getApptForSlot(time);
                  return (
                    <div key={time} className="flex gap-3 group">
                      <div className="w-14 pt-2 text-xs text-muted-foreground font-mono flex-shrink-0">{time}</div>
                      <div className="flex-1 min-h-[40px] border-l border-dashed border-border pl-3">
                        {appt ? (
                          <div
                            onClick={() => setSelectedAppt(appt)}
                            className={cn(
                              'rounded-md border-l-4 px-3 py-2 cursor-pointer hover:opacity-90 transition-opacity',
                              APPOINTMENT_COLORS[appt.type] || 'bg-gray-100 border-gray-400 text-gray-800'
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs font-semibold">{appt.patientName}</p>
                                <p className="text-[10px] opacity-80 mt-0.5">{appt.type} • {appt.duration}min • {appt.reason}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {appt.room && <span className="text-[10px] opacity-70">{appt.room}</span>}
                                <span className={cn('badge-status text-[10px]', getAppointmentStatusColor(appt.status))}>
                                  {appt.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="h-8 rounded-md hover:bg-muted/40 transition-colors cursor-pointer group-hover:border group-hover:border-dashed group-hover:border-border flex items-center pl-2 opacity-0 group-hover:opacity-100">
                            <Plus className="w-3 h-3 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {view === 'list' && (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {filtered.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8">No appointments for this day.</p>
                ) : (
                  filtered.map(appt => (
                    <div
                      key={appt.id}
                      onClick={() => setSelectedAppt(appt)}
                      className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/30 cursor-pointer transition-colors"
                    >
                      <div className="text-center w-16 flex-shrink-0">
                        <p className="text-sm font-bold text-[hsl(var(--primary))]">{appt.time}</p>
                        <p className="text-[10px] text-muted-foreground">{appt.duration}min</p>
                      </div>
                      <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: appt.type === 'New Patient' ? '#3b82f6' : appt.type === 'Follow-up' ? '#14b8a6' : '#a855f7' }}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{appt.patientName}</p>
                        <p className="text-xs text-muted-foreground">{appt.reason}</p>
                      </div>
                      <div className="text-right flex-shrink-0 hidden md:block">
                        <p className="text-xs font-medium">{appt.providerName}</p>
                        <p className="text-xs text-muted-foreground">{appt.type}</p>
                      </div>
                      <span className={cn('badge-status', getAppointmentStatusColor(appt.status))}>
                        {appt.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppt && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl shadow-2xl w-full max-w-md">
            <div className={cn('p-4 rounded-t-xl border-l-4', APPOINTMENT_COLORS[selectedAppt.type] || 'bg-gray-100 border-gray-400')}>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wide opacity-70">{selectedAppt.type}</span>
                  <h2 className="text-lg font-bold mt-0.5">{selectedAppt.patientName}</h2>
                </div>
                <button onClick={() => setSelectedAppt(null)} className="text-xl font-light opacity-60 hover:opacity-100">✕</button>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {[
                ['Date & Time', `${selectedAppt.date} at ${selectedAppt.time} (${selectedAppt.duration} min)`],
                ['Provider', selectedAppt.providerName],
                ['Reason', selectedAppt.reason],
                ['Room', selectedAppt.room || 'Not assigned'],
                ['Status', selectedAppt.status],
                ['Notes', selectedAppt.notes || '—'],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-3">
                  <span className="text-xs text-muted-foreground w-24 flex-shrink-0 pt-0.5">{label}</span>
                  <span className="text-sm font-medium">{value}</span>
                </div>
              ))}
            </div>
            <div className="px-4 pb-4 flex gap-2 justify-end">
              <button className="btn-outline" onClick={() => setSelectedAppt(null)}>Close</button>
              <button className="btn-primary">Update Status</button>
            </div>
          </div>
        </div>
      )}

      {/* New Appointment Modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-bold">New Appointment</h2>
              <button onClick={() => setShowNew(false)} className="text-muted-foreground hover:text-foreground text-xl">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="label-text block mb-1">Patient *</label>
                <select className="select-field">
                  <option value="">Select patient...</option>
                  {MOCK_APPOINTMENTS.map(a => <option key={a.patientId}>{a.patientName}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text block mb-1">Date *</label>
                  <input type="date" className="input-field" defaultValue={selectedDate} />
                </div>
                <div>
                  <label className="label-text block mb-1">Time *</label>
                  <select className="select-field">
                    {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label-text block mb-1">Provider *</label>
                <select className="select-field">
                  <option>Dr. Sarah Mitchell</option>
                  <option>Dr. Michael Torres</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text block mb-1">Type *</label>
                  <select className="select-field">
                    <option>New Patient</option>
                    <option>Follow-up</option>
                    <option>Consultation</option>
                    <option>Procedure</option>
                    <option>Telehealth</option>
                  </select>
                </div>
                <div>
                  <label className="label-text block mb-1">Duration</label>
                  <select className="select-field">
                    <option>15 min</option>
                    <option>30 min</option>
                    <option>45 min</option>
                    <option>60 min</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label-text block mb-1">Reason for Visit *</label>
                <input className="input-field" placeholder="Chief complaint or visit reason" />
              </div>
            </div>
            <div className="px-5 pb-5 flex justify-end gap-2">
              <button className="btn-outline" onClick={() => setShowNew(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => setShowNew(false)}>Schedule Appointment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
