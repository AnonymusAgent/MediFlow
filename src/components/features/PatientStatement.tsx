import { useState, useRef } from 'react';
import { MOCK_PATIENTS, MOCK_CLAIMS, MOCK_PAYMENTS } from '@/constants/mockData';
import { formatCurrency, formatDate, calculateAge, cn } from '@/lib/utils';
import { Printer, Send, Download, X, FileText, DollarSign, CheckCircle, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface StatementLine {
  date: string;
  description: string;
  claimNumber: string;
  charges: number;
  insurance: number;
  adjustments: number;
  patientPaid: number;
  balance: number;
}

export default function PatientStatement() {
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [statementDate] = useState(new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const patient = MOCK_PATIENTS.find(p => p.id === selectedPatientId);
  const patientClaims = MOCK_CLAIMS.filter(c => c.patientId === selectedPatientId);
  const patientPayments = MOCK_PAYMENTS.filter(p => patientClaims.some(c => c.id === p.claimId));

  const statementLines: StatementLine[] = patientClaims.map(claim => {
    const insurancePaid = claim.paidAmount || 0;
    const adjustments = claim.adjustments || 0;
    const patientPaymentsForClaim = patientPayments
      .filter(p => p.claimId === claim.id && (p.paymentType === 'Patient' || p.paymentType === 'Copay' || p.paymentType === 'Deductible'))
      .reduce((s, p) => s + p.amount, 0);
    return {
      date: claim.dateOfService,
      description: claim.procedureCodes[0]?.description || 'Medical Services',
      claimNumber: claim.claimNumber,
      charges: claim.totalCharges,
      insurance: insurancePaid,
      adjustments,
      patientPaid: patientPaymentsForClaim,
      balance: claim.balance,
    };
  });

  const totalCharges = statementLines.reduce((s, l) => s + l.charges, 0);
  const totalInsurance = statementLines.reduce((s, l) => s + l.insurance, 0);
  const totalAdjustments = statementLines.reduce((s, l) => s + l.adjustments, 0);
  const totalPatientPaid = statementLines.reduce((s, l) => s + l.patientPaid, 0);
  const totalBalance = statementLines.reduce((s, l) => s + l.balance, 0);

  const handleSend = () => {
    if (!patient?.email) {
      toast.error('No email address on file for this patient');
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      toast.success(`Statement sent to ${patient.email}`);
    }, 1500);
  };

  const handlePrint = () => {
    window.print();
    toast.success('Print dialog opened');
  };

  const StatementDocument = () => (
    <div ref={printRef} className="bg-white p-8 max-w-2xl mx-auto font-sans text-sm">
      {/* Letterhead */}
      <div className="flex items-start justify-between pb-5 border-b-2 border-[hsl(213,72%,22%)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-[hsl(172,66%,42%)] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-[hsl(213,72%,22%)] font-bold text-xl">MediFlow Health</span>
          </div>
          <p className="text-gray-500 text-xs">123 Medical Center Drive, Nashville, TN 37201</p>
          <p className="text-gray-500 text-xs">Tel: (615) 555-0100 • Fax: (615) 555-0101</p>
          <p className="text-gray-500 text-xs">billing@mediflow.com</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg text-[hsl(213,72%,22%)]">PATIENT STATEMENT</p>
          <p className="text-xs text-gray-500 mt-1">Statement Date: {statementDate}</p>
          <p className="text-xs text-gray-500">Statement #: STMT-{Date.now().toString().slice(-6)}</p>
        </div>
      </div>

      {/* Patient + Balance Due */}
      <div className="flex items-start justify-between mt-5 mb-6">
        <div>
          <p className="text-[10px] font-semibold uppercase text-gray-400 tracking-wide mb-1">Billed To</p>
          {patient ? (
            <>
              <p className="font-bold text-base">{patient.firstName} {patient.lastName}</p>
              <p className="text-xs text-gray-600">{patient.address}</p>
              <p className="text-xs text-gray-600">{patient.city}, {patient.state} {patient.zip}</p>
              <p className="text-xs text-gray-600 mt-1">{patient.phone}</p>
            </>
          ) : (
            <p className="text-gray-400 italic">Select a patient to generate statement</p>
          )}
        </div>
        <div className="bg-[hsl(213,72%,22%)] text-white rounded-xl px-6 py-4 text-right min-w-[160px]">
          <p className="text-xs opacity-70">Total Amount Due</p>
          <p className="text-3xl font-bold mt-1">{formatCurrency(totalBalance)}</p>
          <p className="text-xs opacity-70 mt-1">Due within 30 days</p>
        </div>
      </div>

      {/* Insurance on File */}
      {patient && (
        <div className="bg-gray-50 rounded-lg p-3 mb-5 border border-gray-200">
          <p className="text-[10px] font-semibold uppercase text-gray-400 tracking-wide mb-1.5">Insurance on File</p>
          <div className="flex items-center gap-6 text-xs">
            <div>
              <span className="text-gray-500">Primary: </span>
              <span className="font-medium">{patient.primaryInsurance.payerName}</span>
              <span className="text-gray-400 ml-2">#{patient.primaryInsurance.memberId}</span>
            </div>
            {patient.secondaryInsurance && (
              <div>
                <span className="text-gray-500">Secondary: </span>
                <span className="font-medium">{patient.secondaryInsurance.payerName}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Itemized Charges Table */}
      <table className="w-full text-xs border-collapse mb-5">
        <thead>
          <tr className="bg-[hsl(213,72%,22%)] text-white">
            <th className="text-left px-3 py-2">Date of Service</th>
            <th className="text-left px-3 py-2">Description</th>
            <th className="text-right px-3 py-2">Charges</th>
            <th className="text-right px-3 py-2">Ins Paid</th>
            <th className="text-right px-3 py-2">Adj</th>
            <th className="text-right px-3 py-2">Pt Paid</th>
            <th className="text-right px-3 py-2">Balance</th>
          </tr>
        </thead>
        <tbody>
          {statementLines.map((line, i) => (
            <tr key={line.claimNumber} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-3 py-2 text-gray-600">{formatDate(line.date)}</td>
              <td className="px-3 py-2">
                <p className="font-medium truncate max-w-[160px]">{line.description}</p>
                <p className="text-[10px] text-gray-400">{line.claimNumber}</p>
              </td>
              <td className="px-3 py-2 text-right">{formatCurrency(line.charges)}</td>
              <td className="px-3 py-2 text-right text-emerald-700">{line.insurance > 0 ? formatCurrency(line.insurance) : '—'}</td>
              <td className="px-3 py-2 text-right text-orange-600">{line.adjustments > 0 ? `-${formatCurrency(line.adjustments)}` : '—'}</td>
              <td className="px-3 py-2 text-right text-blue-700">{line.patientPaid > 0 ? formatCurrency(line.patientPaid) : '—'}</td>
              <td className={cn('px-3 py-2 text-right font-bold', line.balance > 0 ? 'text-red-600' : 'text-emerald-600')}>
                {formatCurrency(line.balance)}
              </td>
            </tr>
          ))}

          {/* Totals Row */}
          <tr className="border-t-2 border-[hsl(213,72%,22%)] font-bold bg-gray-50">
            <td className="px-3 py-2 text-right text-xs uppercase tracking-wide text-gray-500" colSpan={2}>Totals</td>
            <td className="px-3 py-2 text-right">{formatCurrency(totalCharges)}</td>
            <td className="px-3 py-2 text-right text-emerald-700">{formatCurrency(totalInsurance)}</td>
            <td className="px-3 py-2 text-right text-orange-600">{totalAdjustments > 0 ? `-${formatCurrency(totalAdjustments)}` : '—'}</td>
            <td className="px-3 py-2 text-right text-blue-700">{formatCurrency(totalPatientPaid)}</td>
            <td className={cn('px-3 py-2 text-right text-base', totalBalance > 0 ? 'text-red-600' : 'text-emerald-600')}>
              {formatCurrency(totalBalance)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Payment Instructions */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <p className="font-semibold text-xs mb-2 text-[hsl(213,72%,22%)]">PAYMENT OPTIONS</p>
          <div className="space-y-1 text-xs text-gray-600">
            <p>• Online: patient.mediflow.com/pay</p>
            <p>• Phone: (615) 555-0100 ext. 2</p>
            <p>• Mail: Check payable to MediFlow Health</p>
            <p>• In Office: Visa, MC, Discover, Cash</p>
          </div>
        </div>
        <div className="border border-[hsl(172,66%,42%)] rounded-lg p-4 bg-[hsl(172,66%,95%)]">
          <p className="font-semibold text-xs mb-2 text-[hsl(172,66%,32%)]">PAYMENT PLAN AVAILABLE</p>
          <p className="text-xs text-gray-600">Need help with your balance? Call us to set up an interest-free payment plan. We are committed to making healthcare accessible.</p>
          <p className="text-xs font-medium text-[hsl(172,66%,32%)] mt-1">(615) 555-0100 ext. 3</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 text-center text-[10px] text-gray-400">
        <p>This statement covers services provided at MediFlow Health. For questions or disputes, contact billing@mediflow.com within 30 days.</p>
        <p className="mt-0.5">HIPAA Notice: This document contains protected health information and is intended solely for the named patient.</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-5">
      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card rounded-xl shadow-2xl w-full max-w-3xl">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30 rounded-t-xl">
              <h3 className="font-semibold text-sm flex items-center gap-2"><FileText className="w-4 h-4" /> Patient Statement Preview</h3>
              <div className="flex items-center gap-2">
                <button
                  className={cn('btn-primary py-1.5 text-xs', sending && 'opacity-70 cursor-wait', sent && 'bg-emerald-600')}
                  onClick={handleSend}
                  disabled={sending || sent}
                >
                  {sent ? <><CheckCircle className="w-3.5 h-3.5" /> Sent!</> :
                   sending ? <><RefreshCwIcon className="w-3.5 h-3.5 animate-spin" /> Sending...</> :
                   <><Mail className="w-3.5 h-3.5" /> Send Statement</>}
                </button>
                <button className="btn-outline py-1.5 text-xs" onClick={handlePrint}>
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button className="btn-outline py-1.5 text-xs" onClick={() => setShowPreview(false)}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {/* Statement Content */}
            <div className="overflow-y-auto max-h-[80vh] bg-gray-100 p-4">
              <div className="shadow-lg rounded-lg overflow-hidden">
                <StatementDocument />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Patient Statement Generator</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Generate, print, and send itemized billing statements</p>
        </div>
      </div>

      {/* Generator Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1 space-y-4">
          <div className="stat-card space-y-4">
            <h3 className="section-title">Statement Settings</h3>
            <div>
              <label className="label-text block mb-1">Select Patient *</label>
              <select
                className="select-field"
                value={selectedPatientId}
                onChange={e => { setSelectedPatientId(e.target.value); setSent(false); }}
              >
                <option value="">Choose a patient...</option>
                {MOCK_PATIENTS.map(p => (
                  <option key={p.id} value={p.id}>{p.firstName} {p.lastName} — {p.mrn}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-text block mb-1">Statement Date</label>
              <input type="text" className="input-field" value={statementDate} readOnly />
            </div>
            <div>
              <label className="label-text block mb-1">Statement Type</label>
              <select className="select-field">
                <option>Current Balance Statement</option>
                <option>Full Year Statement</option>
                <option>Single Visit Statement</option>
              </select>
            </div>
            {patient && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                <p className="text-xs font-semibold text-blue-700 mb-1">Patient on File</p>
                <p className="text-xs text-blue-600">{patient.firstName} {patient.lastName}</p>
                <p className="text-xs text-blue-500">{patient.phone}</p>
                {patient.email && <p className="text-xs text-blue-500">{patient.email}</p>}
                <p className="text-xs text-blue-500 mt-1">Insurance: {patient.primaryInsurance.payerName}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              className="w-full btn-primary justify-center py-3"
              disabled={!selectedPatientId}
              onClick={() => setShowPreview(true)}
            >
              <FileText className="w-4 h-4" /> Preview Statement
            </button>
            <button
              className="w-full btn-outline justify-center py-2.5"
              disabled={!selectedPatientId || !patient?.email}
              onClick={handleSend}
            >
              {sent ? <><CheckCircle className="w-4 h-4 text-emerald-500" /> Statement Sent!</> : <><Send className="w-4 h-4" /> Send via Email</>}
            </button>
            <button
              className="w-full btn-outline justify-center py-2.5"
              disabled={!selectedPatientId}
              onClick={handlePrint}
            >
              <Download className="w-4 h-4" /> Download / Print
            </button>
          </div>
        </div>

        {/* Statement Preview Panel */}
        <div className="lg:col-span-2">
          {selectedPatientId && patient ? (
            <div className="stat-card space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="section-title">Statement Summary</h3>
                <span className="text-xs text-muted-foreground">{patientClaims.length} visit(s)</span>
              </div>

              {/* Balance Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Total Charges', value: formatCurrency(totalCharges), color: 'text-foreground' },
                  { label: 'Insurance Paid', value: formatCurrency(totalInsurance), color: 'text-emerald-600' },
                  { label: 'Adjustments', value: formatCurrency(totalAdjustments), color: 'text-orange-600' },
                  { label: 'Patient Balance', value: formatCurrency(totalBalance), color: totalBalance > 0 ? 'text-red-600' : 'text-emerald-600' },
                ].map(s => (
                  <div key={s.label} className="bg-muted/40 rounded-lg p-3 text-center">
                    <p className="label-text text-center">{s.label}</p>
                    <p className={cn('text-lg font-bold mt-1', s.color)}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Itemized Line Items */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Itemized Charges</h4>
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border">
                        <th className="text-left px-3 py-2 label-text">Date</th>
                        <th className="text-left px-3 py-2 label-text">Service</th>
                        <th className="text-right px-3 py-2 label-text">Charges</th>
                        <th className="text-right px-3 py-2 label-text">Ins Paid</th>
                        <th className="text-right px-3 py-2 label-text">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {statementLines.map(line => (
                        <tr key={line.claimNumber}>
                          <td className="px-3 py-2.5 text-muted-foreground">{formatDate(line.date)}</td>
                          <td className="px-3 py-2.5">
                            <p className="font-medium text-foreground">{line.description.length > 40 ? line.description.slice(0, 40) + '…' : line.description}</p>
                            <p className="text-[10px] text-muted-foreground">{line.claimNumber}</p>
                          </td>
                          <td className="px-3 py-2.5 text-right">{formatCurrency(line.charges)}</td>
                          <td className="px-3 py-2.5 text-right text-emerald-600">{line.insurance > 0 ? formatCurrency(line.insurance) : '—'}</td>
                          <td className={cn('px-3 py-2.5 text-right font-bold', line.balance > 0 ? 'text-red-600' : 'text-emerald-600')}>
                            {formatCurrency(line.balance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted/30 border-t-2 border-border font-bold">
                        <td className="px-3 py-2.5 text-xs uppercase text-muted-foreground" colSpan={2}>Total</td>
                        <td className="px-3 py-2.5 text-right">{formatCurrency(totalCharges)}</td>
                        <td className="px-3 py-2.5 text-right text-emerald-600">{formatCurrency(totalInsurance)}</td>
                        <td className={cn('px-3 py-2.5 text-right', totalBalance > 0 ? 'text-red-600' : 'text-emerald-600')}>
                          {formatCurrency(totalBalance)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {totalBalance > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-red-600" />
                    <div>
                      <p className="text-sm font-semibold text-red-700">Payment Due: {formatCurrency(totalBalance)}</p>
                      <p className="text-xs text-red-500">Please remit within 30 days of statement date</p>
                    </div>
                  </div>
                  <button className="btn-primary text-xs py-1.5 px-3" onClick={() => setShowPreview(true)}>
                    View Full Statement
                  </button>
                </div>
              )}

              {totalBalance <= 0 && patientClaims.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <p className="text-sm font-medium text-emerald-700">Account is paid in full — no balance due.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="stat-card flex items-center justify-center min-h-[400px] text-center">
              <div>
                <FileText className="w-14 h-14 mx-auto text-border mb-3" />
                <p className="font-semibold text-muted-foreground">Select a patient to generate a statement</p>
                <p className="text-xs text-muted-foreground mt-1">Itemized charges, insurance payments, and balance will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Inline icon to avoid extra import complexity
function RefreshCwIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}
