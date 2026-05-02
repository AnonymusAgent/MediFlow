import { useState } from 'react';
import { MOCK_CLAIMS } from '@/constants/mockData';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import {
  Upload, CheckCircle, AlertTriangle, DollarSign, FileText,
  RefreshCw, ChevronDown, ChevronUp, X, Zap, BarChart2
} from 'lucide-react';
import { toast } from 'sonner';

interface ERALine {
  claimNumber: string;
  patientName: string;
  dateOfService: string;
  chargeAmount: number;
  allowedAmount: number;
  contractualAdj: number;
  coinsurance: number;
  copay: number;
  deductible: number;
  paidAmount: number;
  status: 'Paid' | 'Denied' | 'Partial' | 'No Match';
  denialCode?: string;
  denialReason?: string;
  matched: boolean;
  claimId?: string;
  posted?: boolean;
}

const MOCK_ERA_FILE = {
  eraNumber: 'ERA-2026042801',
  payerName: 'Blue Cross Blue Shield',
  payerId: 'BCBS01',
  checkNumber: 'CHK-20260428-4891',
  paymentDate: '2026-04-28',
  totalPaid: 489.50,
  claimCount: 4,
  lines: [
    {
      claimNumber: 'CLM-2026-001234',
      patientName: 'Robert Johnson',
      dateOfService: '2026-04-15',
      chargeAmount: 285.00,
      allowedAmount: 198.50,
      contractualAdj: 86.50,
      coinsurance: 0,
      copay: 30.00,
      deductible: 0,
      paidAmount: 168.50,
      status: 'Paid' as const,
      matched: true,
      claimId: 'c001',
    },
    {
      claimNumber: 'CLM-2026-001238',
      patientName: 'Robert Johnson',
      dateOfService: '2026-04-10',
      chargeAmount: 145.00,
      allowedAmount: 101.50,
      contractualAdj: 43.50,
      coinsurance: 0,
      copay: 30.00,
      deductible: 0,
      paidAmount: 71.50,
      status: 'Partial' as const,
      matched: true,
      claimId: 'c005',
    },
    {
      claimNumber: 'CLM-2026-001241',
      patientName: 'Sarah Connor',
      dateOfService: '2026-04-12',
      chargeAmount: 320.00,
      allowedAmount: 249.50,
      contractualAdj: 70.50,
      coinsurance: 0,
      copay: 25.00,
      deductible: 0,
      paidAmount: 224.50,
      status: 'Paid' as const,
      matched: false,
    },
    {
      claimNumber: 'CLM-2026-001242',
      patientName: 'James Lee',
      dateOfService: '2026-04-14',
      chargeAmount: 198.00,
      allowedAmount: 0,
      contractualAdj: 0,
      coinsurance: 0,
      copay: 0,
      deductible: 0,
      paidAmount: 0,
      status: 'Denied' as const,
      denialCode: 'CO-4',
      denialReason: 'Service requires prior authorization',
      matched: false,
    },
  ] as ERALine[],
};

export default function ERAPosting() {
  const [step, setStep] = useState<'upload' | 'review' | 'posted'>('upload');
  const [processing, setProcessing] = useState(false);
  const [lines, setLines] = useState<ERALine[]>([]);
  const [expandedLine, setExpandedLine] = useState<string | null>(null);
  const [eraData, setEraData] = useState(MOCK_ERA_FILE);

  const handleLoadERA = () => {
    setProcessing(true);
    setTimeout(() => {
      setLines(MOCK_ERA_FILE.lines.map(l => ({ ...l, posted: false })));
      setProcessing(false);
      setStep('review');
      toast.success('ERA file parsed — 4 claims found');
    }, 1800);
  };

  const handlePostAll = () => {
    setProcessing(true);
    setTimeout(() => {
      setLines(prev => prev.map(l => ({ ...l, posted: l.matched && l.status !== 'Denied' })));
      setProcessing(false);
      setStep('posted');
      toast.success('ERA auto-posted — 2 claims matched and posted');
    }, 2000);
  };

  const handlePostLine = (claimNumber: string) => {
    setLines(prev => prev.map(l => l.claimNumber === claimNumber ? { ...l, posted: true } : l));
    toast.success(`Payment posted for ${claimNumber}`);
  };

  const matchedLines = lines.filter(l => l.matched);
  const unmatchedLines = lines.filter(l => !l.matched);
  const postedCount = lines.filter(l => l.posted).length;
  const totalPosted = lines.filter(l => l.posted).reduce((s, l) => s + l.paidAmount, 0);
  const totalDenied = lines.filter(l => l.status === 'Denied').reduce((s, l) => s + l.chargeAmount, 0);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ERA Auto-Posting</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Parse, match, and post Electronic Remittance Advice files</p>
        </div>
        {step !== 'upload' && (
          <button className="btn-outline" onClick={() => { setStep('upload'); setLines([]); }}>
            <RefreshCw className="w-4 h-4" /> Load New ERA
          </button>
        )}
      </div>

      {/* Step: Upload */}
      {step === 'upload' && (
        <div className="space-y-5">
          {/* ERA File Selector (simulated) */}
          <div className="stat-card">
            <h3 className="section-title mb-4">Load ERA File</h3>
            <div className="border-2 border-dashed border-border rounded-xl p-10 text-center bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer" onClick={handleLoadERA}>
              <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="font-semibold text-sm">Click to load ERA file (simulated)</p>
              <p className="text-xs text-muted-foreground mt-1">Supports 835 EDI transaction files</p>
            </div>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-xs font-semibold text-blue-700 mb-2">Demo ERA: {MOCK_ERA_FILE.eraNumber}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div><p className="text-muted-foreground">Payer</p><p className="font-medium">{MOCK_ERA_FILE.payerName}</p></div>
                <div><p className="text-muted-foreground">Check #</p><p className="font-medium">{MOCK_ERA_FILE.checkNumber}</p></div>
                <div><p className="text-muted-foreground">Payment Date</p><p className="font-medium">{formatDate(MOCK_ERA_FILE.paymentDate)}</p></div>
                <div><p className="text-muted-foreground">Total Paid</p><p className="font-bold text-emerald-600">{formatCurrency(MOCK_ERA_FILE.totalPaid)}</p></div>
              </div>
            </div>

            <div className="mt-4 flex justify-center">
              <button
                className="btn-primary px-8 py-3 text-base"
                onClick={handleLoadERA}
                disabled={processing}
              >
                {processing ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" /> Parsing ERA...</>
                ) : (
                  <><Zap className="w-4 h-4" /> Parse ERA File</>
                )}
              </button>
            </div>
          </div>

          {/* Recent ERAs */}
          <div className="stat-card">
            <h3 className="section-title mb-3">Recent ERA Activity</h3>
            <div className="space-y-2">
              {[
                { era: 'ERA-20260422-001', payer: 'Blue Cross Blue Shield', total: 168.50, claims: 1, date: '04/22/2026', status: 'Posted' },
                { era: 'ERA-20260420-002', payer: 'Blue Cross Blue Shield', total: 71.50, claims: 1, date: '04/20/2026', status: 'Posted' },
                { era: 'ERA-20260415-003', payer: 'Medicare', total: 312.00, claims: 3, date: '04/15/2026', status: 'Posted' },
              ].map(row => (
                <div key={row.era} className="flex items-center justify-between px-4 py-3 rounded-md bg-muted/30 hover:bg-muted/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-medium">{row.era}</p>
                      <p className="text-[10px] text-muted-foreground">{row.payer} • {row.date} • {row.claims} claim(s)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-bold text-emerald-600">{formatCurrency(row.total)}</p>
                    <span className="badge-status text-emerald-700 bg-emerald-50">{row.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step: Review */}
      {step === 'review' && (
        <div className="space-y-5">
          {/* ERA Header */}
          <div className="stat-card border-l-4 border-[hsl(var(--teal))]">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <p className="label-text">ERA Number</p>
                <p className="text-lg font-bold mt-0.5">{eraData.eraNumber}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                <div><p className="label-text">Payer</p><p className="font-medium mt-0.5">{eraData.payerName}</p></div>
                <div><p className="label-text">Check #</p><p className="font-medium mt-0.5">{eraData.checkNumber}</p></div>
                <div><p className="label-text">Payment Date</p><p className="font-medium mt-0.5">{formatDate(eraData.paymentDate)}</p></div>
                <div><p className="label-text">Total Payment</p><p className="font-bold text-emerald-600 text-lg mt-0.5">{formatCurrency(eraData.totalPaid)}</p></div>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Claims', value: lines.length.toString(), color: 'text-[hsl(var(--primary))]' },
              { label: 'Auto-Matched', value: matchedLines.length.toString(), color: 'text-emerald-600' },
              { label: 'Unmatched / Manual', value: unmatchedLines.length.toString(), color: 'text-orange-600' },
              { label: 'Denied', value: lines.filter(l => l.status === 'Denied').length.toString(), color: 'text-red-600' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <p className="label-text">{s.label}</p>
                <p className={cn('text-2xl font-bold mt-1', s.color)}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Claim Lines */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="section-title">ERA Claim Lines</h3>
              <button
                className="btn-primary"
                onClick={handlePostAll}
                disabled={processing}
              >
                {processing ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" /> Posting...</>
                ) : (
                  <><Zap className="w-4 h-4" /> Auto-Post All Matched</>
                )}
              </button>
            </div>

            {lines.map(line => (
              <div key={line.claimNumber} className={cn(
                'bg-card border rounded-lg overflow-hidden',
                line.status === 'Denied' ? 'border-red-200' :
                line.matched ? 'border-emerald-200' : 'border-orange-200'
              )}>
                <div
                  className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-muted/20"
                  onClick={() => setExpandedLine(expandedLine === line.claimNumber ? null : line.claimNumber)}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                    line.status === 'Denied' ? 'bg-red-100' :
                    line.matched ? 'bg-emerald-100' : 'bg-orange-100'
                  )}>
                    {line.status === 'Denied' ? <X className="w-4 h-4 text-red-600" /> :
                     line.matched ? <CheckCircle className="w-4 h-4 text-emerald-600" /> :
                     <AlertTriangle className="w-4 h-4 text-orange-600" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{line.patientName}</p>
                      <span className="font-mono text-[10px] text-muted-foreground">{line.claimNumber.split('-').slice(1).join('-')}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-muted-foreground">DOS: {formatDate(line.dateOfService)}</span>
                      {line.matched && <span className="text-[10px] text-emerald-600 font-medium">✓ Matched to claim</span>}
                      {!line.matched && line.status !== 'Denied' && <span className="text-[10px] text-orange-600 font-medium">⚠ No match found — manual review</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Charged</p>
                      <p className="text-sm font-medium">{formatCurrency(line.chargeAmount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Paid</p>
                      <p className={cn('text-sm font-bold', line.paidAmount > 0 ? 'text-emerald-600' : 'text-red-600')}>
                        {formatCurrency(line.paidAmount)}
                      </p>
                    </div>
                    <span className={cn('badge-status text-xs',
                      line.status === 'Paid' ? 'text-emerald-700 bg-emerald-50' :
                      line.status === 'Partial' ? 'text-teal-700 bg-teal-50' :
                      line.status === 'Denied' ? 'text-red-700 bg-red-50' : 'text-gray-700 bg-gray-50'
                    )}>
                      {line.status}
                    </span>
                    {line.matched && line.status !== 'Denied' && !line.posted && (
                      <button
                        onClick={e => { e.stopPropagation(); handlePostLine(line.claimNumber); }}
                        className="btn-secondary text-xs py-1 px-2.5"
                      >Post</button>
                    )}
                    {line.posted && <span className="text-xs text-emerald-600 font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" />Posted</span>}
                    {expandedLine === line.claimNumber ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>

                {expandedLine === line.claimNumber && (
                  <div className="border-t border-border p-5 bg-muted/10">
                    {line.status === 'Denied' && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <p className="text-xs font-semibold text-red-700">Denial: {line.denialCode}</p>
                        <p className="text-xs text-red-600 mt-0.5">{line.denialReason}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {[
                        ['Charge Amount', formatCurrency(line.chargeAmount)],
                        ['Allowed Amount', formatCurrency(line.allowedAmount)],
                        ['Contractual Adj', `-${formatCurrency(line.contractualAdj)}`],
                        ['Copay', formatCurrency(line.copay)],
                        ['Coinsurance', formatCurrency(line.coinsurance)],
                        ['Deductible', formatCurrency(line.deductible)],
                        ['Net Paid', formatCurrency(line.paidAmount)],
                        ['Patient Resp', formatCurrency(line.copay + line.coinsurance + line.deductible)],
                      ].map(([l, v]) => (
                        <div key={l}>
                          <p className="label-text">{l}</p>
                          <p className={cn('font-semibold mt-0.5', l === 'Net Paid' ? 'text-emerald-600' : '')}>{v}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step: Posted */}
      {step === 'posted' && (
        <div className="space-y-5">
          <div className="stat-card border-l-4 border-emerald-500 bg-emerald-50/30">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-emerald-700">ERA Posted Successfully</h2>
                <p className="text-sm text-muted-foreground mt-0.5">{eraData.eraNumber} • {formatDate(eraData.paymentDate)}</p>
              </div>
            </div>
          </div>

          {/* Reconciliation Summary */}
          <div className="stat-card">
            <h3 className="section-title mb-4 flex items-center gap-2"><BarChart2 className="w-4 h-4" /> Reconciliation Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {[
                { label: 'Claims Processed', value: lines.length.toString(), sub: 'In this ERA file', color: 'text-[hsl(var(--primary))]' },
                { label: 'Auto-Posted', value: postedCount.toString(), sub: 'Matched & posted', color: 'text-emerald-600' },
                { label: 'Requires Review', value: (lines.length - postedCount).toString(), sub: 'Unmatched or denied', color: 'text-orange-600' },
                { label: 'Total Payments Posted', value: formatCurrency(totalPosted), sub: 'Applied to claims', color: 'text-emerald-600' },
                { label: 'Contractual Adjustments', value: formatCurrency(lines.reduce((s, l) => s + l.contractualAdj, 0)), sub: 'Written off per contract', color: 'text-muted-foreground' },
                { label: 'Denied Amount', value: formatCurrency(totalDenied), sub: 'Requires appeal/write-off', color: 'text-red-600' },
              ].map(s => (
                <div key={s.label} className="bg-muted/30 rounded-lg p-4">
                  <p className="label-text">{s.label}</p>
                  <p className={cn('text-xl font-bold mt-1', s.color)}>{s.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Line Detail */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {['Claim', 'Patient', 'Charged', 'Allowed', 'Adj', 'Paid', 'Patient Resp', 'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-3 label-text">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {lines.map(line => (
                  <tr key={line.claimNumber} className="table-row-hover">
                    <td className="px-4 py-3 font-mono text-xs text-[hsl(var(--primary))]">{line.claimNumber.split('-').slice(1).join('-')}</td>
                    <td className="px-4 py-3 text-xs font-medium">{line.patientName}</td>
                    <td className="px-4 py-3 text-xs">{formatCurrency(line.chargeAmount)}</td>
                    <td className="px-4 py-3 text-xs">{formatCurrency(line.allowedAmount)}</td>
                    <td className="px-4 py-3 text-xs text-orange-600">-{formatCurrency(line.contractualAdj)}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-emerald-600">{formatCurrency(line.paidAmount)}</td>
                    <td className="px-4 py-3 text-xs">{formatCurrency(line.copay + line.coinsurance + line.deductible)}</td>
                    <td className="px-4 py-3">
                      <span className={cn('badge-status text-xs',
                        line.posted ? 'text-emerald-700 bg-emerald-50' :
                        line.status === 'Denied' ? 'text-red-700 bg-red-50' : 'text-orange-700 bg-orange-50'
                      )}>
                        {line.posted ? 'Posted' : line.status === 'Denied' ? 'Denied' : 'Manual Review'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <button className="btn-outline" onClick={() => { setStep('upload'); setLines([]); }}>
              <RefreshCw className="w-4 h-4" /> Load Another ERA
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
