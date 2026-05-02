import { useState } from 'react';
import { Search, Plus, Eye, Edit, FileText, Shield, RefreshCw, CheckCircle, XCircle, AlertTriangle, ChevronDown } from 'lucide-react';
import { MOCK_PATIENTS } from '@/constants/mockData';
import { Patient } from '@/types';
import { formatDate, calculateAge, getEligibilityColor, cn } from '@/lib/utils';
import { toast } from 'sonner';

interface EligibilityResult {
  status: 'Verified' | 'Failed';
  copay: number;
  deductible: number;
  deductibleMet: number;
  outOfPocketMax: number;
  outOfPocketMet: number;
  planName: string;
  effectiveDate: string;
  terminationDate: string | null;
  coinsurance: number;
  priorAuthRequired: string[];
  coveredServices: string[];
  networkStatus: 'In-Network' | 'Out-of-Network';
  checkedAt: string;
}

function runEligibilityCheck(patient: Patient): Promise<EligibilityResult> {
  return new Promise(resolve => {
    setTimeout(() => {
      const isVerified = patient.primaryInsurance.eligibilityStatus !== 'Failed';
      resolve({
        status: isVerified ? 'Verified' : 'Failed',
        copay: patient.primaryInsurance.copay ?? 30,
        deductible: patient.primaryInsurance.deductible ?? 2000,
        deductibleMet: patient.primaryInsurance.deductibleMet ?? 450,
        outOfPocketMax: (patient.primaryInsurance.deductible ?? 2000) * 2,
        outOfPocketMet: (patient.primaryInsurance.deductibleMet ?? 450) * 1.3,
        planName: patient.primaryInsurance.planName,
        effectiveDate: patient.primaryInsurance.effectiveDate,
        terminationDate: patient.primaryInsurance.terminationDate || null,
        coinsurance: 20,
        priorAuthRequired: ['CT Scan', 'MRI', 'Echocardiography', 'Physical Therapy > 12 visits'],
        coveredServices: ['Office Visits', 'Labs', 'Preventive Care', 'Emergency', 'Inpatient', 'Mental Health'],
        networkStatus: 'In-Network',
        checkedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      });
    }, 2200);
  });
}

interface PatientDetailProps {
  patient: Patient;
  onClose: () => void;
}

function PatientDetail({ patient, onClose }: PatientDetailProps) {
  const [tab, setTab] = useState<'demographics' | 'insurance' | 'claims'>('demographics');
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState<EligibilityResult | null>(null);

  const handleVerifyEligibility = async () => {
    setEligibilityLoading(true);
    setEligibilityResult(null);
    setTab('insurance');
    try {
      const result = await runEligibilityCheck(patient);
      setEligibilityResult(result);
      toast.success(`Eligibility ${result.status === 'Verified' ? 'verified' : 'check failed'} for ${patient.firstName} ${patient.lastName}`);
    } finally {
      setEligibilityLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[hsl(var(--primary))] p-5 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold">{patient.firstName} {patient.lastName}</h2>
              <div className="flex items-center gap-3 mt-1 text-sm text-white/80">
                <span>MRN: {patient.mrn}</span>
                <span>DOB: {formatDate(patient.dob)} (Age {calculateAge(patient.dob)})</span>
                <span className="capitalize">{patient.gender}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleVerifyEligibility}
                disabled={eligibilityLoading}
                className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
              >
                {eligibilityLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Shield className="w-3 h-3" />}
                {eligibilityLoading ? 'Checking...' : 'Verify Eligibility'}
              </button>
              <span className={cn('badge-status text-xs', patient.status === 'Active' ? 'bg-emerald-400/20 text-emerald-200' : 'bg-red-400/20 text-red-200')}>
                {patient.status}
              </span>
              <button onClick={onClose} className="ml-2 text-white/80 hover:text-white text-xl font-light">✕</button>
            </div>
          </div>
          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            {(['demographics', 'insurance', 'claims'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn('px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors',
                  tab === t ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'demographics' && (
            <div className="grid grid-cols-2 gap-4">
              {[
                ['Phone', patient.phone],
                ['Email', patient.email || '—'],
                ['Address', patient.address],
                ['City/State/ZIP', `${patient.city}, ${patient.state} ${patient.zip}`],
                ['Provider', patient.provider],
                ['Patient Since', formatDate(patient.createdAt)],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="label-text">{label}</p>
                  <p className="text-sm font-medium mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          )}

          {tab === 'insurance' && (
            <div className="space-y-4">

              {/* Eligibility Loading Spinner */}
              {eligibilityLoading && (
                <div className="border border-blue-200 bg-blue-50 rounded-lg p-5 flex flex-col items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-blue-700">Verifying Eligibility...</p>
                    <p className="text-xs text-blue-500 mt-0.5">Connecting to {patient.primaryInsurance.payerName} clearinghouse</p>
                  </div>
                  <div className="w-full bg-blue-100 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                  </div>
                </div>
              )}

              {/* Eligibility Result */}
              {eligibilityResult && !eligibilityLoading && (
                <div className={cn(
                  'rounded-lg border-2 p-4',
                  eligibilityResult.status === 'Verified' ? 'border-emerald-300 bg-emerald-50' : 'border-red-300 bg-red-50'
                )}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {eligibilityResult.status === 'Verified'
                        ? <CheckCircle className="w-5 h-5 text-emerald-600" />
                        : <XCircle className="w-5 h-5 text-red-600" />}
                      <div>
                        <p className={cn('font-bold text-sm', eligibilityResult.status === 'Verified' ? 'text-emerald-700' : 'text-red-700')}>
                          Eligibility {eligibilityResult.status}
                        </p>
                        <p className="text-xs text-muted-foreground">Checked at {eligibilityResult.checkedAt} today</p>
                      </div>
                    </div>
                    <span className={cn('badge-status font-bold', eligibilityResult.networkStatus === 'In-Network' ? 'text-emerald-700 bg-emerald-100' : 'text-red-700 bg-red-100')}>
                      {eligibilityResult.networkStatus}
                    </span>
                  </div>

                  {eligibilityResult.status === 'Verified' && (
                    <>
                      {/* Coverage Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                        {[
                          { label: 'Copay', value: `$${eligibilityResult.copay}`, highlight: false },
                          { label: 'Coinsurance', value: `${eligibilityResult.coinsurance}%`, highlight: false },
                          { label: 'Deductible', value: `$${eligibilityResult.deductible.toLocaleString()}`, highlight: false },
                          { label: 'Deductible Met', value: `$${eligibilityResult.deductibleMet.toLocaleString()}`, highlight: true },
                          { label: 'OOP Max', value: `$${eligibilityResult.outOfPocketMax.toLocaleString()}`, highlight: false },
                          { label: 'OOP Met', value: `$${Math.round(eligibilityResult.outOfPocketMet).toLocaleString()}`, highlight: true },
                        ].map(item => (
                          <div key={item.label} className={cn('rounded-md p-2.5 text-center', item.highlight ? 'bg-white border border-emerald-200' : 'bg-emerald-100/50')}>
                            <p className="text-[10px] text-muted-foreground uppercase font-medium">{item.label}</p>
                            <p className={cn('font-bold text-sm mt-0.5', item.highlight ? 'text-emerald-700' : 'text-foreground')}>{item.value}</p>
                          </div>
                        ))}
                      </div>

                      {/* Deductible Progress */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Deductible Progress</span>
                          <span className="font-medium">${eligibilityResult.deductibleMet} / ${eligibilityResult.deductible}</span>
                        </div>
                        <div className="w-full bg-emerald-100 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-emerald-500 transition-all"
                            style={{ width: `${Math.min((eligibilityResult.deductibleMet / eligibilityResult.deductible) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Covered Services & Prior Auth */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[10px] font-semibold uppercase text-emerald-700 mb-1.5">Covered Services</p>
                          <div className="space-y-1">
                            {eligibilityResult.coveredServices.map(s => (
                              <div key={s} className="flex items-center gap-1.5 text-xs text-emerald-700">
                                <CheckCircle className="w-3 h-3 flex-shrink-0" />{s}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase text-orange-700 mb-1.5">Prior Auth Required</p>
                          <div className="space-y-1">
                            {eligibilityResult.priorAuthRequired.map(s => (
                              <div key={s} className="flex items-center gap-1.5 text-xs text-orange-600">
                                <AlertTriangle className="w-3 h-3 flex-shrink-0" />{s}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {eligibilityResult.status === 'Failed' && (
                    <div className="text-xs text-red-600 space-y-1">
                      <p>• Coverage could not be confirmed with {patient.primaryInsurance.payerName}</p>
                      <p>• Plan may be terminated or member ID may be incorrect</p>
                      <p>• Contact payer at (800) 555-0000 to verify coverage manually</p>
                    </div>
                  )}
                </div>
              )}

              {/* Primary Insurance */}
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[hsl(var(--teal))]" /> Primary Insurance
                  </h4>
                  <span className={cn('badge-status', getEligibilityColor(patient.primaryInsurance.eligibilityStatus))}>
                    {patient.primaryInsurance.eligibilityStatus}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['Payer', patient.primaryInsurance.payerName],
                    ['Member ID', patient.primaryInsurance.memberId],
                    ['Group #', patient.primaryInsurance.groupNumber || '—'],
                    ['Plan', patient.primaryInsurance.planName],
                    ['Effective', formatDate(patient.primaryInsurance.effectiveDate)],
                    ['Copay', patient.primaryInsurance.copay != null ? `$${patient.primaryInsurance.copay}` : '—'],
                    ['Deductible', patient.primaryInsurance.deductible != null ? `$${patient.primaryInsurance.deductible}` : '—'],
                    ['Deductible Met', patient.primaryInsurance.deductibleMet != null ? `$${patient.primaryInsurance.deductibleMet}` : '—'],
                  ].map(([l, v]) => (
                    <div key={l}>
                      <p className="label-text">{l}</p>
                      <p className="text-sm font-medium mt-0.5">{v}</p>
                    </div>
                  ))}
                </div>
              </div>

              {patient.secondaryInsurance && (
                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-500" /> Secondary Insurance
                    </h4>
                    <span className={cn('badge-status', getEligibilityColor(patient.secondaryInsurance.eligibilityStatus))}>
                      {patient.secondaryInsurance.eligibilityStatus}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ['Payer', patient.secondaryInsurance.payerName],
                      ['Member ID', patient.secondaryInsurance.memberId],
                      ['Plan', patient.secondaryInsurance.planName],
                      ['Effective', formatDate(patient.secondaryInsurance.effectiveDate)],
                    ].map(([l, v]) => (
                      <div key={l}>
                        <p className="label-text">{l}</p>
                        <p className="text-sm font-medium mt-0.5">{v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'claims' && (
            <div className="text-sm text-muted-foreground text-center py-8">
              <FileText className="w-10 h-10 mx-auto mb-2 text-border" />
              <p>Claims history visible in the Claims module.</p>
            </div>
          )}
        </div>

        <div className="border-t border-border px-5 py-3 flex justify-end gap-2">
          <button className="btn-outline" onClick={onClose}>Close</button>
          <button className="btn-primary"><Edit className="w-4 h-4" /> Edit Patient</button>
        </div>
      </div>
    </div>
  );
}

export default function Patients() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const filtered = MOCK_PATIENTS.filter(p => {
    const matchSearch = `${p.firstName} ${p.lastName} ${p.mrn} ${p.phone}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 space-y-5">
      {selectedPatient && <PatientDetail patient={selectedPatient} onClose={() => setSelectedPatient(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Patient Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{MOCK_PATIENTS.length} total patients</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> New Patient
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, MRN, or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          {['All', 'Active', 'Inactive', 'Pending'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn('px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                statusFilter === s
                  ? 'bg-[hsl(var(--primary))] text-white'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/70'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left px-4 py-3 label-text">Patient</th>
              <th className="text-left px-4 py-3 label-text">MRN</th>
              <th className="text-left px-4 py-3 label-text">DOB / Age</th>
              <th className="text-left px-4 py-3 label-text hidden md:table-cell">Phone</th>
              <th className="text-left px-4 py-3 label-text hidden lg:table-cell">Insurance</th>
              <th className="text-left px-4 py-3 label-text hidden lg:table-cell">Eligibility</th>
              <th className="text-left px-4 py-3 label-text">Status</th>
              <th className="text-left px-4 py-3 label-text">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((patient) => (
              <tr key={patient.id} className="table-row-hover" onClick={() => setSelectedPatient(patient)}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[hsl(var(--primary))]/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-[hsl(var(--primary))] text-xs font-bold">
                        {patient.firstName[0]}{patient.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                      <p className="text-xs text-muted-foreground">{patient.provider}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{patient.mrn}</td>
                <td className="px-4 py-3">
                  <p className="text-xs">{formatDate(patient.dob)}</p>
                  <p className="text-xs text-muted-foreground">Age {calculateAge(patient.dob)}</p>
                </td>
                <td className="px-4 py-3 text-xs hidden md:table-cell">{patient.phone}</td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <p className="text-xs font-medium">{patient.primaryInsurance.payerName}</p>
                  <p className="text-xs text-muted-foreground">{patient.primaryInsurance.memberId}</p>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className={cn('badge-status', getEligibilityColor(patient.primaryInsurance.eligibilityStatus))}>
                    {patient.primaryInsurance.eligibilityStatus}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn('badge-status',
                    patient.status === 'Active' ? 'text-emerald-700 bg-emerald-50' :
                    patient.status === 'Inactive' ? 'text-red-700 bg-red-50' : 'text-yellow-700 bg-yellow-50'
                  )}>
                    {patient.status}
                  </span>
                </td>
                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedPatient(patient)}
                      className="w-7 h-7 rounded hover:bg-muted flex items-center justify-center"
                      title="View patient"
                    >
                      <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                    <button className="w-7 h-7 rounded hover:bg-muted flex items-center justify-center" title="Edit">
                      <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No patients found matching your search.
          </div>
        )}
      </div>

      {/* Add Patient Modal (simplified) */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl shadow-2xl w-full max-w-lg">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-bold">New Patient Registration</h2>
              <button onClick={() => setShowAdd(false)} className="text-muted-foreground hover:text-foreground text-xl">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text block mb-1">First Name *</label>
                  <input className="input-field" placeholder="First name" />
                </div>
                <div>
                  <label className="label-text block mb-1">Last Name *</label>
                  <input className="input-field" placeholder="Last name" />
                </div>
                <div>
                  <label className="label-text block mb-1">Date of Birth *</label>
                  <input type="date" className="input-field" />
                </div>
                <div>
                  <label className="label-text block mb-1">Gender *</label>
                  <select className="select-field">
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="label-text block mb-1">Phone *</label>
                  <input className="input-field" placeholder="(555) 000-0000" />
                </div>
                <div>
                  <label className="label-text block mb-1">Email</label>
                  <input className="input-field" placeholder="email@example.com" />
                </div>
              </div>
              <div>
                <label className="label-text block mb-1">Address</label>
                <input className="input-field" placeholder="Street address" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label-text block mb-1">City</label>
                  <input className="input-field" placeholder="City" />
                </div>
                <div>
                  <label className="label-text block mb-1">State</label>
                  <input className="input-field" placeholder="TN" />
                </div>
                <div>
                  <label className="label-text block mb-1">ZIP</label>
                  <input className="input-field" placeholder="37201" />
                </div>
              </div>
            </div>
            <div className="px-5 pb-5 flex justify-end gap-2">
              <button className="btn-outline" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => setShowAdd(false)}>Register Patient</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
