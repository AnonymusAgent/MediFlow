import { useState } from 'react';
import { MOCK_PATIENTS, MOCK_CLAIMS, CPT_CODES, ICD10_CODES } from '@/constants/mockData';
import { formatDate, cn } from '@/lib/utils';
import {
  Plus, Search, Shield, CheckCircle, XCircle, Clock, AlertTriangle,
  ChevronDown, ChevronUp, X, Calendar, RefreshCw, FileText
} from 'lucide-react';
import { toast } from 'sonner';

interface PriorAuthRequest {
  id: string;
  patientId: string;
  patientName: string;
  providerId: string;
  providerName: string;
  payerName: string;
  payerId: string;
  procedureCode: string;
  procedureDesc: string;
  diagnosisCode: string;
  diagnosisDesc: string;
  requestedUnits: number;
  approvedUnits?: number;
  authNumber?: string;
  status: 'Pending' | 'Approved' | 'Denied' | 'Expired' | 'Cancelled';
  submittedDate: string;
  startDate: string;
  expirationDate?: string;
  denialReason?: string;
  urgency: 'Routine' | 'Urgent' | 'Emergent';
  clinicalNotes: string;
  attachmentsCount: number;
}

const MOCK_AUTH: PriorAuthRequest[] = [
  {
    id: 'pa001', patientId: 'p002', patientName: 'Maria Garcia',
    providerId: 'u5', providerName: 'Dr. Michael Torres',
    payerName: 'Aetna', payerId: 'AETN01',
    procedureCode: '93306', procedureDesc: 'Echocardiography, transthoracic',
    diagnosisCode: 'R07.9', diagnosisDesc: 'Chest pain, unspecified',
    requestedUnits: 1, approvedUnits: 1,
    authNumber: 'AUTH-AETN-2026041801',
    status: 'Approved',
    submittedDate: '2026-04-16', startDate: '2026-04-18', expirationDate: '2026-07-18',
    urgency: 'Urgent', clinicalNotes: 'Patient presenting with exertional chest pain and atypical angina symptoms. History of hypertension and elevated lipids. EKG shows ST depression.',
    attachmentsCount: 3,
  },
  {
    id: 'pa002', patientId: 'p004', patientName: 'Jennifer Williams',
    providerId: 'u5', providerName: 'Dr. Michael Torres',
    payerName: 'United Healthcare', payerId: 'UHHC01',
    procedureCode: '71046', procedureDesc: 'Radiology exam of chest, 2 views',
    diagnosisCode: 'J18.9', diagnosisDesc: 'Pneumonia, unspecified organism',
    requestedUnits: 1,
    status: 'Pending',
    submittedDate: '2026-04-25', startDate: '2026-04-25',
    urgency: 'Routine', clinicalNotes: 'Patient with persistent cough and low-grade fever for 10 days. Suspected community-acquired pneumonia. Requesting chest x-ray for confirmation.',
    attachmentsCount: 1,
  },
  {
    id: 'pa003', patientId: 'p005', patientName: 'Charles Brown',
    providerId: 'u1', providerName: 'Dr. Sarah Mitchell',
    payerName: 'Medicare', payerId: 'MCARE',
    procedureCode: '93306', procedureDesc: 'Echocardiography, transthoracic',
    diagnosisCode: 'I48.91', diagnosisDesc: 'Unspecified atrial fibrillation',
    requestedUnits: 1,
    status: 'Denied',
    submittedDate: '2026-03-28', startDate: '2026-03-30',
    denialReason: 'Service was already provided within the same episode of care. Duplicate request.',
    urgency: 'Routine', clinicalNotes: 'Follow-up echocardiogram for known atrial fibrillation patient.',
    attachmentsCount: 2,
  },
  {
    id: 'pa004', patientId: 'p001', patientName: 'Robert Johnson',
    providerId: 'u1', providerName: 'Dr. Sarah Mitchell',
    payerName: 'Blue Cross Blue Shield', payerId: 'BCBS01',
    procedureCode: '85025', procedureDesc: 'Complete blood count with differential',
    diagnosisCode: 'I10', diagnosisDesc: 'Essential (primary) hypertension',
    requestedUnits: 4, approvedUnits: 4,
    authNumber: 'AUTH-BCBS-2025120101',
    status: 'Expired',
    submittedDate: '2025-12-01', startDate: '2025-12-01', expirationDate: '2026-03-01',
    urgency: 'Routine', clinicalNotes: 'Quarterly CBC monitoring for hypertensive patient on ACE inhibitor therapy.',
    attachmentsCount: 1,
  },
];

const STATUS_CONFIG = {
  Pending: { icon: Clock, color: 'text-yellow-700 bg-yellow-50', border: 'border-yellow-200', badge: 'text-yellow-700 bg-yellow-50' },
  Approved: { icon: CheckCircle, color: 'text-emerald-700 bg-emerald-50', border: 'border-emerald-200', badge: 'text-emerald-700 bg-emerald-50' },
  Denied: { icon: XCircle, color: 'text-red-700 bg-red-50', border: 'border-red-200', badge: 'text-red-700 bg-red-50' },
  Expired: { icon: AlertTriangle, color: 'text-orange-700 bg-orange-50', border: 'border-orange-200', badge: 'text-orange-700 bg-orange-50' },
  Cancelled: { icon: X, color: 'text-gray-700 bg-gray-50', border: 'border-gray-200', badge: 'text-gray-700 bg-gray-50' },
};

interface AuthFormProps {
  onSubmit: (auth: PriorAuthRequest) => void;
  onClose: () => void;
}

function AuthForm({ onSubmit, onClose }: AuthFormProps) {
  const [form, setForm] = useState({
    patientId: '',
    procedureCode: '',
    diagnosisCode: '',
    requestedUnits: 1,
    urgency: 'Routine' as PriorAuthRequest['urgency'],
    startDate: new Date().toISOString().split('T')[0],
    clinicalNotes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const patient = MOCK_PATIENTS.find(p => p.id === form.patientId);
  const cptCode = CPT_CODES.find(c => c.code === form.procedureCode);
  const icdCode = ICD10_CODES.find(c => c.code === form.diagnosisCode);

  const handleSubmit = () => {
    if (!form.patientId || !form.procedureCode || !form.diagnosisCode) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      const auth: PriorAuthRequest = {
        id: `pa${Date.now()}`,
        patientId: form.patientId,
        patientName: patient ? `${patient.firstName} ${patient.lastName}` : '',
        providerId: 'u1',
        providerName: 'Dr. Sarah Mitchell',
        payerName: patient?.primaryInsurance.payerName || '',
        payerId: patient?.primaryInsurance.payerId || '',
        procedureCode: form.procedureCode,
        procedureDesc: cptCode?.description || '',
        diagnosisCode: form.diagnosisCode,
        diagnosisDesc: icdCode?.description || '',
        requestedUnits: form.requestedUnits,
        status: 'Pending',
        submittedDate: new Date().toISOString().split('T')[0],
        startDate: form.startDate,
        urgency: form.urgency,
        clinicalNotes: form.clinicalNotes,
        attachmentsCount: 0,
      };
      onSubmit(auth);
      toast.success('Prior authorization request submitted successfully');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-[hsl(var(--primary))] px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-white" />
            <div>
              <h2 className="text-white font-bold text-lg">Submit Auth Request</h2>
              <p className="text-white/70 text-xs">Prior authorization for procedures requiring pre-approval</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          <div>
            <label className="label-text block mb-1">Patient *</label>
            <select className="select-field" value={form.patientId} onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))}>
              <option value="">Select patient...</option>
              {MOCK_PATIENTS.map(p => (
                <option key={p.id} value={p.id}>{p.firstName} {p.lastName} — {p.primaryInsurance.payerName}</option>
              ))}
            </select>
            {patient && (
              <p className="text-xs text-muted-foreground mt-1">Insurance: {patient.primaryInsurance.payerName} | ID: {patient.primaryInsurance.memberId}</p>
            )}
          </div>

          <div>
            <label className="label-text block mb-1">Procedure (CPT) *</label>
            <select className="select-field" value={form.procedureCode} onChange={e => setForm(f => ({ ...f, procedureCode: e.target.value }))}>
              <option value="">Select CPT code...</option>
              {CPT_CODES.map(c => (
                <option key={c.code} value={c.code}>{c.code} — {c.description.slice(0, 55)}...</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-text block mb-1">Primary Diagnosis (ICD-10) *</label>
            <select className="select-field" value={form.diagnosisCode} onChange={e => setForm(f => ({ ...f, diagnosisCode: e.target.value }))}>
              <option value="">Select diagnosis...</option>
              {ICD10_CODES.map(c => (
                <option key={c.code} value={c.code}>{c.code} — {c.description}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label-text block mb-1">Requested Units</label>
              <input type="number" min={1} className="input-field" value={form.requestedUnits} onChange={e => setForm(f => ({ ...f, requestedUnits: parseInt(e.target.value) || 1 }))} />
            </div>
            <div>
              <label className="label-text block mb-1">Start Date</label>
              <input type="date" className="input-field" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div>
              <label className="label-text block mb-1">Urgency</label>
              <select className="select-field" value={form.urgency} onChange={e => setForm(f => ({ ...f, urgency: e.target.value as PriorAuthRequest['urgency'] }))}>
                <option>Routine</option>
                <option>Urgent</option>
                <option>Emergent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label-text block mb-1">Clinical Notes / Medical Necessity</label>
            <textarea
              className="input-field resize-none"
              rows={4}
              placeholder="Describe medical necessity, clinical findings, and reason for authorization request..."
              value={form.clinicalNotes}
              onChange={e => setForm(f => ({ ...f, clinicalNotes: e.target.value }))}
            />
          </div>
        </div>

        <div className="border-t border-border px-5 py-3 flex justify-between items-center flex-shrink-0 bg-muted/20">
          <p className="text-xs text-muted-foreground">Auth requests are electronically submitted to the payer</p>
          <div className="flex gap-2">
            <button className="btn-outline" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? <><RefreshCw className="w-4 h-4 animate-spin" />Submitting...</> : <><Shield className="w-4 h-4" />Submit Request</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PriorAuth() {
  const [auths, setAuths] = useState<PriorAuthRequest[]>(MOCK_AUTH);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = auths.filter(a => {
    const matchSearch = `${a.patientName} ${a.procedureCode} ${a.authNumber || ''} ${a.payerName}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSubmit = (auth: PriorAuthRequest) => {
    setAuths(prev => [auth, ...prev]);
    setShowForm(false);
  };

  const expiringCount = auths.filter(a => {
    if (a.status !== 'Approved' || !a.expirationDate) return false;
    const exp = new Date(a.expirationDate);
    const days = (exp.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return days <= 30 && days > 0;
  }).length;

  return (
    <div className="p-6 space-y-5">
      {showForm && <AuthForm onSubmit={handleSubmit} onClose={() => setShowForm(false)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Prior Authorizations</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track and manage prior auth requests per patient and procedure</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" /> Submit Auth Request
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Auths', value: auths.length, color: 'text-[hsl(var(--primary))]' },
          { label: 'Pending', value: auths.filter(a => a.status === 'Pending').length, color: 'text-yellow-600' },
          { label: 'Approved', value: auths.filter(a => a.status === 'Approved').length, color: 'text-emerald-600' },
          { label: 'Denied', value: auths.filter(a => a.status === 'Denied').length, color: 'text-red-600' },
          { label: 'Expiring Soon', value: expiringCount, color: 'text-orange-600' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <p className="label-text">{s.label}</p>
            <p className={cn('text-2xl font-bold mt-1', s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input className="input-field pl-9" placeholder="Search by patient, CPT, or auth number..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {['All', 'Pending', 'Approved', 'Denied', 'Expired'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={cn('px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              statusFilter === s ? 'bg-[hsl(var(--primary))] text-white' : 'bg-secondary text-secondary-foreground hover:bg-secondary/70'
            )}>
            {s}
          </button>
        ))}
      </div>

      {/* Auth List */}
      <div className="space-y-3">
        {filtered.map(auth => {
          const config = STATUS_CONFIG[auth.status];
          const Icon = config.icon;
          const isExpanded = expandedId === auth.id;

          const isExpiringSoon = auth.status === 'Approved' && auth.expirationDate && (() => {
            const days = (new Date(auth.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
            return days <= 30 && days > 0;
          })();

          return (
            <div key={auth.id} className={cn('bg-card border rounded-lg overflow-hidden', config.border)}>
              <div className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-muted/20" onClick={() => setExpandedId(isExpanded ? null : auth.id)}>
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', config.color)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm">{auth.patientName}</p>
                    <span className="font-mono text-xs text-muted-foreground">{auth.procedureCode}</span>
                    {isExpiringSoon && <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">Expiring Soon</span>}
                    <span className={cn('badge-status text-xs', auth.urgency === 'Urgent' ? 'text-orange-700 bg-orange-50' : auth.urgency === 'Emergent' ? 'text-red-700 bg-red-50' : 'text-gray-600 bg-gray-50')}>{auth.urgency}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-muted-foreground">{auth.payerName}</span>
                    <span className="text-xs text-muted-foreground">Submitted: {formatDate(auth.submittedDate)}</span>
                    {auth.authNumber && <span className="text-xs text-emerald-600 font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" />Auth #: {auth.authNumber}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {auth.approvedUnits && (
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Approved Units</p>
                      <p className="text-sm font-bold text-emerald-600">{auth.approvedUnits}</p>
                    </div>
                  )}
                  {auth.expirationDate && auth.status === 'Approved' && (
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Expires</p>
                      <p className="text-xs font-medium">{formatDate(auth.expirationDate)}</p>
                    </div>
                  )}
                  <span className={cn('badge-status', config.badge)}>{auth.status}</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-border p-5 bg-muted/10">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {[
                      ['Procedure', `${auth.procedureCode} — ${auth.procedureDesc}`],
                      ['Diagnosis', `${auth.diagnosisCode} — ${auth.diagnosisDesc}`],
                      ['Requested Units', auth.requestedUnits.toString()],
                      ['Approved Units', auth.approvedUnits?.toString() || '—'],
                      ['Provider', auth.providerName],
                      ['Start Date', formatDate(auth.startDate)],
                      ['Expiration', auth.expirationDate ? formatDate(auth.expirationDate) : '—'],
                      ['Attachments', `${auth.attachmentsCount} file(s)`],
                    ].map(([l, v]) => (
                      <div key={l}>
                        <p className="label-text">{l}</p>
                        <p className="text-xs font-medium mt-0.5">{v}</p>
                      </div>
                    ))}
                  </div>
                  {auth.clinicalNotes && (
                    <div className="mb-3">
                      <p className="label-text mb-1">Clinical Notes</p>
                      <p className="text-xs leading-relaxed text-foreground">{auth.clinicalNotes}</p>
                    </div>
                  )}
                  {auth.status === 'Denied' && auth.denialReason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-xs font-bold text-red-700">Denial Reason</p>
                      <p className="text-xs text-red-600 mt-0.5">{auth.denialReason}</p>
                      <button className="text-xs text-red-700 underline mt-2">Submit Appeal →</button>
                    </div>
                  )}
                  {auth.status === 'Pending' && (
                    <div className="flex gap-2 mt-3">
                      <button
                        className="btn-primary text-xs py-1.5"
                        onClick={() => {
                          setAuths(prev => prev.map(a => a.id === auth.id ? {
                            ...a, status: 'Approved', approvedUnits: a.requestedUnits,
                            authNumber: `AUTH-${a.payerId}-${Date.now().toString().slice(-8)}`,
                            expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                          } : a));
                          toast.success('Auth request approved (simulated)');
                        }}
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Simulate Approval
                      </button>
                      <button
                        className="btn-outline text-xs py-1.5 text-red-600 border-red-200"
                        onClick={() => {
                          setAuths(prev => prev.map(a => a.id === auth.id ? {
                            ...a, status: 'Denied', denialReason: 'Service not medically necessary per clinical guidelines.'
                          } : a));
                          toast.error('Auth request denied (simulated)');
                        }}
                      >
                        <XCircle className="w-3.5 h-3.5" /> Simulate Denial
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Shield className="w-12 h-12 mx-auto mb-3 text-border" />
            <p className="text-sm">No prior authorizations found.</p>
            <button className="btn-primary mt-4 mx-auto" onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4" /> Submit First Auth Request
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
