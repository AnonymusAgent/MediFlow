import { useState } from 'react';
import { MOCK_PATIENTS, MOCK_CLAIMS, CPT_CODES, ICD10_CODES } from '@/constants/mockData';
import { ProcedureCode, DiagnosisCode } from '@/types';
import { formatCurrency, cn } from '@/lib/utils';
import { Plus, Search, Trash2, CheckCircle, AlertTriangle, XCircle, ShieldCheck, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { toast } from 'sonner';

// Scrub rule engine
interface ScrubResult {
  type: 'error' | 'warning' | 'pass';
  message: string;
  code?: string;
  fixHint?: string;
}

function runScrubEngine(
  patientId: string,
  dos: string,
  diagnosisCodes: DiagnosisCode[],
  procedureCodes: ProcedureCode[],
): ScrubResult[] {
  const results: ScrubResult[] = [];

  // Patient check
  if (!patientId) {
    results.push({ type: 'error', message: 'No patient selected', fixHint: 'Select a patient before submitting' });
  }

  // DOS check
  if (!dos) {
    results.push({ type: 'error', message: 'Date of service is missing', fixHint: 'Enter a valid date of service' });
  } else {
    const dosDate = new Date(dos);
    const today = new Date();
    if (dosDate > today) {
      results.push({ type: 'error', message: 'Date of service is in the future', fixHint: 'Verify the date of service' });
    }
    const diffDays = (today.getTime() - dosDate.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays > 365) {
      results.push({ type: 'warning', message: 'Date of service is older than 365 days — timely filing risk', fixHint: 'Verify payer timely filing limit' });
    }
  }

  // Diagnosis checks
  if (diagnosisCodes.length === 0) {
    results.push({ type: 'error', message: 'No diagnosis codes entered', fixHint: 'Add at least one ICD-10 diagnosis code' });
  } else {
    if (!diagnosisCodes.find(d => d.type === 'Primary')) {
      results.push({ type: 'error', message: 'Primary diagnosis not designated', fixHint: 'Set one code as Primary diagnosis' });
    }
    diagnosisCodes.forEach(dx => {
      if (dx.code.endsWith('9') || dx.code.includes('unspec')) {
        results.push({ type: 'warning', code: dx.code, message: `Code ${dx.code} — may be too unspecific. Use a more specific code if clinical documentation supports it.`, fixHint: 'Review documentation for specificity' });
      }
    });
  }

  // Procedure checks
  if (procedureCodes.length === 0) {
    results.push({ type: 'error', message: 'No procedure codes entered', fixHint: 'Add at least one CPT code' });
  } else {
    procedureCodes.forEach(px => {
      // Units check
      if (px.units < 1 || px.units > 99) {
        results.push({ type: 'error', code: px.code, message: `CPT ${px.code} — invalid units (${px.units}). Units must be 1–99.`, fixHint: 'Correct the units field' });
      }
      if (px.units > 10) {
        results.push({ type: 'warning', code: px.code, message: `CPT ${px.code} — high units (${px.units}). Unusual unit count may trigger review.`, fixHint: 'Confirm units are medically necessary' });
      }

      // Modifier checks
      const emCodes = ['99211', '99212', '99213', '99214', '99215', '99201', '99202', '99203', '99204', '99205'];
      const procedureCodes_local = procedureCodes.map(p => p.code);
      if (emCodes.includes(px.code) && procedureCodes.some(p => !emCodes.includes(p.code))) {
        if (!px.modifier || px.modifier !== '25') {
          results.push({ type: 'warning', code: px.code, message: `CPT ${px.code} (E&M) billed same day as procedure — Modifier 25 may be required.`, fixHint: 'Add modifier 25 to the E&M code' });
        }
      }

      // Charge amount check
      if (px.chargeAmount <= 0) {
        results.push({ type: 'error', code: px.code, message: `CPT ${px.code} — charge amount is $0.00 or negative.`, fixHint: 'Enter a valid charge amount' });
      }

      // CPT-ICD10 compatibility (simplified rules)
      if (px.code === '93306' && !diagnosisCodes.some(d => ['I10', 'R07.9', 'I25.10', 'I48.91'].includes(d.code))) {
        results.push({ type: 'error', code: px.code, message: `CPT 93306 (Echocardiography) requires a cardiac diagnosis code. Current diagnosis does not support medical necessity.`, fixHint: 'Add a cardiac ICD-10 code (e.g., I10, R07.9, I25.10)' });
      }
      if (px.code === '93000' && !diagnosisCodes.some(d => ['I10', 'R07.9', 'I25.10', 'I48.91', 'Z00.00'].includes(d.code))) {
        results.push({ type: 'warning', code: px.code, message: `CPT 93000 (EKG) — verify medical necessity with current diagnosis codes.`, fixHint: 'Confirm cardiac/preventive diagnosis supports EKG' });
      }
      if ((px.code.startsWith('992') || px.code === '99385' || px.code === '99386') && diagnosisCodes.length === 0) {
        results.push({ type: 'error', code: px.code, message: `E&M code ${px.code} requires at least one diagnosis code.`, fixHint: 'Add appropriate ICD-10 diagnosis code' });
      }
      if (px.code === '99385' || px.code === '99386') {
        if (!diagnosisCodes.some(d => d.code === 'Z00.00')) {
          results.push({ type: 'warning', code: px.code, message: `CPT ${px.code} (Preventive) typically requires Z00.00 as primary diagnosis.`, fixHint: 'Add Z00.00 as primary diagnosis' });
        }
      }
    });

    // Duplicate CPT check
    const seen = new Set<string>();
    procedureCodes.forEach(px => {
      if (seen.has(px.code)) {
        results.push({ type: 'error', code: px.code, message: `Duplicate CPT code ${px.code} detected. Use units instead of billing the same code twice.`, fixHint: 'Remove duplicate and increase units' });
      }
      seen.add(px.code);
    });
  }

  // All passed
  if (results.length === 0) {
    results.push({ type: 'pass', message: 'All scrub checks passed — claim is clean and ready to submit.' });
  }

  return results;
}

export default function ChargeEntry() {
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('Dr. Sarah Mitchell');
  const [dos, setDos] = useState('2026-04-28');
  const [diagnosisCodes, setDiagnosisCodes] = useState<DiagnosisCode[]>([]);
  const [procedureCodes, setProcedureCodes] = useState<ProcedureCode[]>([]);
  const [dxSearch, setDxSearch] = useState('');
  const [cptSearch, setCptSearch] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [scrubResults, setScrubResults] = useState<ScrubResult[] | null>(null);
  const [showScrubReport, setShowScrubReport] = useState(false);
  const [scrubRunning, setScrubRunning] = useState(false);

  const filteredDx = ICD10_CODES.filter(d =>
    d.code.toLowerCase().includes(dxSearch.toLowerCase()) ||
    d.description.toLowerCase().includes(dxSearch.toLowerCase())
  ).slice(0, 6);

  const filteredCpt = CPT_CODES.filter(c =>
    c.code.toLowerCase().includes(cptSearch.toLowerCase()) ||
    c.description.toLowerCase().includes(cptSearch.toLowerCase())
  ).slice(0, 6);

  const addDxCode = (code: { code: string; description: string }) => {
    if (diagnosisCodes.length >= 12) return;
    if (diagnosisCodes.find(d => d.code === code.code)) return;
    const type = diagnosisCodes.length === 0 ? 'Primary' : diagnosisCodes.length === 1 ? 'Secondary' : 'Tertiary';
    setDiagnosisCodes([...diagnosisCodes, { ...code, type }]);
    setDxSearch('');
    setScrubResults(null);
  };

  const addCptCode = (code: { code: string; description: string; fee: number }) => {
    if (procedureCodes.find(p => p.code === code.code)) return;
    setProcedureCodes([...procedureCodes, { code: code.code, description: code.description, units: 1, chargeAmount: code.fee }]);
    setCptSearch('');
    setScrubResults(null);
  };

  const updateModifier = (code: string, modifier: string) => {
    setProcedureCodes(procedureCodes.map(p => p.code === code ? { ...p, modifier: modifier || undefined } : p));
    setScrubResults(null);
  };

  const removeDx = (code: string) => { setDiagnosisCodes(diagnosisCodes.filter(d => d.code !== code)); setScrubResults(null); };
  const removeCpt = (code: string) => { setProcedureCodes(procedureCodes.filter(p => p.code !== code)); setScrubResults(null); };

  const totalCharges = procedureCodes.reduce((sum, p) => sum + (p.chargeAmount * p.units), 0);

  const runScrub = () => {
    setScrubRunning(true);
    setTimeout(() => {
      const results = runScrubEngine(selectedPatient, dos, diagnosisCodes, procedureCodes);
      setScrubResults(results);
      setShowScrubReport(true);
      setScrubRunning(false);
      const errors = results.filter(r => r.type === 'error').length;
      const warnings = results.filter(r => r.type === 'warning').length;
      if (errors > 0) toast.error(`Scrub failed: ${errors} error(s), ${warnings} warning(s)`);
      else if (warnings > 0) toast.warning(`Scrub passed with ${warnings} warning(s) — review before submitting`);
      else toast.success('Claim scrubbed successfully — clean claim!');
    }, 1200);
  };

  const handleSubmit = () => {
    if (!scrubResults) {
      toast.error('Please run claim scrub before submitting');
      return;
    }
    const errors = scrubResults.filter(r => r.type === 'error');
    if (errors.length > 0) {
      toast.error('Cannot submit — resolve scrub errors first');
      setShowScrubReport(true);
      return;
    }
    setSubmitted(true);
    toast.success('Claim created and queued for submission!');
  };

  const scrubErrors = scrubResults ? scrubResults.filter(r => r.type === 'error') : [];
  const scrubWarnings = scrubResults ? scrubResults.filter(r => r.type === 'warning') : [];
  const scrubPassed = scrubResults ? scrubResults.every(r => r.type === 'pass') : false;

  if (submitted) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Claim Created Successfully</h2>
          <p className="text-muted-foreground text-sm mb-1">Claim #CLM-2026-{Math.floor(Math.random() * 10000).toString().padStart(6, '0')}</p>
          <p className="text-sm text-muted-foreground mb-2">Total Charges: {formatCurrency(totalCharges)}</p>
          <p className="text-xs text-emerald-600 mb-6 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Clean claim — passed all scrub checks
          </p>
          <button className="btn-primary" onClick={() => {
            setSubmitted(false); setSelectedPatient(''); setDiagnosisCodes([]);
            setProcedureCodes([]); setScrubResults(null);
          }}>
            Enter New Charges
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Charge Entry</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Enter CPT and ICD-10 codes, scrub, and create a claim</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Patient & Visit Info */}
          <div className="stat-card space-y-4">
            <h3 className="section-title">Visit Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label-text block mb-1">Patient *</label>
                <select className="select-field" value={selectedPatient} onChange={e => { setSelectedPatient(e.target.value); setScrubResults(null); }}>
                  <option value="">Select patient...</option>
                  {MOCK_PATIENTS.map(p => (
                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.mrn})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-text block mb-1">Provider *</label>
                <select className="select-field" value={selectedProvider} onChange={e => setSelectedProvider(e.target.value)}>
                  <option>Dr. Sarah Mitchell</option>
                  <option>Dr. Michael Torres</option>
                </select>
              </div>
              <div>
                <label className="label-text block mb-1">Date of Service *</label>
                <input type="date" className="input-field" value={dos} onChange={e => { setDos(e.target.value); setScrubResults(null); }} />
              </div>
            </div>
          </div>

          {/* Diagnosis Codes */}
          <div className="stat-card space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="section-title">Diagnosis Codes (ICD-10)</h3>
              <span className="text-xs text-muted-foreground">{diagnosisCodes.length}/12</span>
            </div>
            {diagnosisCodes.length > 0 && (
              <div className="space-y-1.5">
                {diagnosisCodes.map((dx, i) => (
                  <div key={dx.code} className="flex items-center gap-3 px-3 py-2 bg-blue-50 rounded-md border border-blue-100">
                    <span className="text-xs font-bold text-blue-700 w-4">{i + 1}</span>
                    <span className="font-mono text-xs font-semibold text-[hsl(var(--primary))] w-16">{dx.code}</span>
                    <span className="text-xs flex-1 text-foreground">{dx.description}</span>
                    <span className="text-[10px] text-blue-500">{dx.type}</span>
                    <button onClick={() => removeDx(dx.code)} className="text-muted-foreground hover:text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input className="input-field pl-9" placeholder="Search ICD-10 by code or description..." value={dxSearch} onChange={e => setDxSearch(e.target.value)} />
              {dxSearch && filteredDx.length > 0 && (
                <div className="absolute top-full mt-1 left-0 right-0 bg-card border border-border rounded-lg shadow-lg z-20 overflow-hidden">
                  {filteredDx.map(d => (
                    <button key={d.code} onClick={() => addDxCode(d)} className="w-full text-left px-4 py-2.5 hover:bg-muted transition-colors border-b border-border last:border-0 flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-[hsl(var(--primary))] w-16 flex-shrink-0">{d.code}</span>
                      <span className="text-xs text-foreground">{d.description}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Procedure Codes */}
          <div className="stat-card space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="section-title">Procedure Codes (CPT / HCPCS)</h3>
              <span className="text-xs text-muted-foreground">{procedureCodes.length} codes</span>
            </div>
            {procedureCodes.length > 0 && (
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr>
                      <th className="text-left px-3 py-2 label-text">CPT</th>
                      <th className="text-left px-3 py-2 label-text">Description</th>
                      <th className="text-center px-3 py-2 label-text w-16">Units</th>
                      <th className="text-center px-3 py-2 label-text w-20">Modifier</th>
                      <th className="text-right px-3 py-2 label-text w-24">Charge</th>
                      <th className="w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {procedureCodes.map(px => (
                      <tr key={px.code}>
                        <td className="px-3 py-2 font-mono text-xs font-bold text-emerald-700">{px.code}</td>
                        <td className="px-3 py-2 text-xs">{px.description}</td>
                        <td className="px-3 py-2 text-center">
                          <input
                            type="number" min={1} max={99} value={px.units}
                            onChange={e => {
                              const units = parseInt(e.target.value) || 1;
                              setProcedureCodes(procedureCodes.map(p => p.code === px.code ? { ...p, units } : p));
                              setScrubResults(null);
                            }}
                            className="w-14 text-center text-xs border border-border rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-[hsl(var(--teal))]"
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <input
                            type="text"
                            maxLength={4}
                            value={px.modifier || ''}
                            onChange={e => updateModifier(px.code, e.target.value.toUpperCase())}
                            placeholder="e.g. 25"
                            className="w-16 text-center text-xs border border-border rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-[hsl(var(--teal))] uppercase"
                          />
                        </td>
                        <td className="px-3 py-2 text-right text-xs font-medium">{formatCurrency(px.chargeAmount * px.units)}</td>
                        <td className="px-3 py-2">
                          <button onClick={() => removeCpt(px.code)} className="text-muted-foreground hover:text-red-500">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input className="input-field pl-9" placeholder="Search CPT by code or description..." value={cptSearch} onChange={e => setCptSearch(e.target.value)} />
              {cptSearch && filteredCpt.length > 0 && (
                <div className="absolute top-full mt-1 left-0 right-0 bg-card border border-border rounded-lg shadow-lg z-20 overflow-hidden">
                  {filteredCpt.map(c => (
                    <button key={c.code} onClick={() => addCptCode(c)} className="w-full text-left px-4 py-2.5 hover:bg-muted transition-colors border-b border-border last:border-0 flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-emerald-700 w-16 flex-shrink-0">{c.code}</span>
                      <span className="text-xs text-foreground flex-1">{c.description}</span>
                      <span className="text-xs font-semibold text-[hsl(var(--primary))]">{formatCurrency(c.fee)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Scrub Report Panel */}
          {scrubResults && (
            <div className={cn(
              'rounded-lg border-2 overflow-hidden',
              scrubErrors.length > 0 ? 'border-red-300' : scrubWarnings.length > 0 ? 'border-yellow-300' : 'border-emerald-300'
            )}>
              <button
                className={cn(
                  'w-full flex items-center justify-between px-5 py-3 font-semibold text-sm',
                  scrubErrors.length > 0 ? 'bg-red-50 text-red-700' : scrubWarnings.length > 0 ? 'bg-yellow-50 text-yellow-700' : 'bg-emerald-50 text-emerald-700'
                )}
                onClick={() => setShowScrubReport(!showScrubReport)}
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Claim Scrub Report
                  {scrubErrors.length > 0 && <span className="text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">{scrubErrors.length} Error{scrubErrors.length > 1 ? 's' : ''}</span>}
                  {scrubWarnings.length > 0 && <span className="text-xs font-bold bg-yellow-500 text-white px-2 py-0.5 rounded-full">{scrubWarnings.length} Warning{scrubWarnings.length > 1 ? 's' : ''}</span>}
                  {scrubPassed && <span className="text-xs font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">Clean Claim</span>}
                </div>
                {showScrubReport ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showScrubReport && (
                <div className="p-4 space-y-2.5 bg-white">
                  {scrubResults.map((r, i) => (
                    <div key={i} className={cn(
                      'flex items-start gap-3 px-3 py-2.5 rounded-md border',
                      r.type === 'error' ? 'bg-red-50 border-red-200' :
                      r.type === 'warning' ? 'bg-yellow-50 border-yellow-200' : 'bg-emerald-50 border-emerald-200'
                    )}>
                      {r.type === 'error' ? <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" /> :
                       r.type === 'warning' ? <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" /> :
                       <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />}
                      <div className="flex-1">
                        <p className={cn('text-xs font-medium',
                          r.type === 'error' ? 'text-red-700' : r.type === 'warning' ? 'text-yellow-700' : 'text-emerald-700'
                        )}>
                          {r.code && <span className="font-mono mr-2">[{r.code}]</span>}
                          {r.message}
                        </p>
                        {r.fixHint && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">Fix: {r.fixHint}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Summary */}
        <div className="space-y-4">
          <div className="stat-card">
            <h3 className="section-title mb-4">Claim Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Patient</span>
                <span className="font-medium text-right text-xs">
                  {selectedPatient ? MOCK_PATIENTS.find(p => p.id === selectedPatient)?.firstName + ' ' + MOCK_PATIENTS.find(p => p.id === selectedPatient)?.lastName : '—'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Provider</span>
                <span className="font-medium text-xs">{selectedProvider}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date of Service</span>
                <span className="font-medium text-xs">{dos}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Dx Codes</span>
                <span className="font-medium">{diagnosisCodes.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">CPT Codes</span>
                <span className="font-medium">{procedureCodes.length}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="text-sm font-semibold">Total Charges</span>
                <span className="text-lg font-bold text-[hsl(var(--teal))]">{formatCurrency(totalCharges)}</span>
              </div>
            </div>
          </div>

          {/* Scrub Status */}
          <div className="stat-card">
            <h3 className="text-sm font-semibold mb-3">Quick Validation</h3>
            <div className="space-y-2">
              {[
                { label: 'Patient selected', ok: !!selectedPatient },
                { label: 'Primary diagnosis', ok: diagnosisCodes.length > 0 },
                { label: 'Procedure code(s)', ok: procedureCodes.length > 0 },
                { label: 'Date of service', ok: !!dos },
                { label: 'Provider assigned', ok: !!selectedProvider },
                { label: 'Claim scrubbed', ok: !!scrubResults && scrubErrors.length === 0 },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2 text-xs">
                  {item.ok
                    ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    : <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
                  }
                  <span className={item.ok ? 'text-foreground' : 'text-muted-foreground'}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Scrub Button */}
          <button
            onClick={runScrub}
            disabled={scrubRunning}
            className={cn(
              'w-full justify-center py-3 text-sm font-semibold rounded-md inline-flex items-center gap-2 transition-colors',
              scrubRunning ? 'bg-muted text-muted-foreground cursor-wait' : 'bg-amber-500 hover:bg-amber-600 text-white'
            )}
          >
            {scrubRunning ? (
              <><ShieldCheck className="w-4 h-4 animate-pulse" /> Running Scrub Engine...</>
            ) : (
              <><Zap className="w-4 h-4" /> Run Claim Scrub</>
            )}
          </button>

          <button
            onClick={handleSubmit}
            disabled={!scrubResults || scrubErrors.length > 0}
            className={cn(
              'w-full btn-primary justify-center py-3 text-base',
              (!scrubResults || scrubErrors.length > 0) && 'opacity-50 cursor-not-allowed'
            )}
          >
            Create Claim
          </button>
          <button className="w-full btn-outline justify-center">Save as Draft</button>

          {scrubResults && scrubErrors.length > 0 && (
            <p className="text-xs text-center text-red-500">Resolve {scrubErrors.length} scrub error(s) before submitting</p>
          )}
        </div>
      </div>
    </div>
  );
}
