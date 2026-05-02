import { MOCK_PAYMENTS } from '@/constants/mockData';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { DollarSign, Plus, Download, CreditCard, Building2, User } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Payments() {
  const [showPost, setShowPost] = useState(false);
  const [paymentType, setPaymentType] = useState<'Insurance' | 'Patient'>('Insurance');

  const stats = {
    total: MOCK_PAYMENTS.reduce((s, p) => s + p.amount, 0),
    insurance: MOCK_PAYMENTS.filter(p => p.paymentType === 'Insurance').reduce((s, p) => s + p.amount, 0),
    patient: MOCK_PAYMENTS.filter(p => p.paymentType !== 'Insurance').reduce((s, p) => s + p.amount, 0),
    count: MOCK_PAYMENTS.length,
  };

  const typeColors: Record<string, string> = {
    Insurance: 'text-blue-700 bg-blue-50',
    Patient: 'text-purple-700 bg-purple-50',
    Copay: 'text-teal-700 bg-teal-50',
    Deductible: 'text-orange-700 bg-orange-50',
  };

  const methodIcons: Record<string, React.ElementType> = {
    'Check': CreditCard,
    'EFT': Building2,
    'Credit Card': CreditCard,
    'Cash': DollarSign,
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payment Posting</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Post ERA/EOB and patient payments</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline"><Download className="w-4 h-4" /> Import ERA</button>
          <button className="btn-primary" onClick={() => setShowPost(true)}><Plus className="w-4 h-4" /> Post Payment</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Posted', value: formatCurrency(stats.total), color: 'text-[hsl(var(--primary))]', icon: DollarSign },
          { label: 'Insurance Payments', value: formatCurrency(stats.insurance), color: 'text-blue-600', icon: Building2 },
          { label: 'Patient Payments', value: formatCurrency(stats.patient), color: 'text-purple-600', icon: User },
          { label: 'Transactions', value: stats.count.toString(), color: 'text-foreground', icon: CreditCard },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="stat-card flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="label-text">{s.label}</p>
                <p className={cn('text-xl font-bold mt-0.5', s.color)}>{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Payments Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 className="section-title">Payment Ledger</h3>
          <span className="text-xs text-muted-foreground">{MOCK_PAYMENTS.length} transactions</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left px-4 py-3 label-text">Date</th>
              <th className="text-left px-4 py-3 label-text">Patient</th>
              <th className="text-left px-4 py-3 label-text hidden md:table-cell">Claim</th>
              <th className="text-left px-4 py-3 label-text">Type</th>
              <th className="text-left px-4 py-3 label-text hidden lg:table-cell">Method</th>
              <th className="text-left px-4 py-3 label-text hidden lg:table-cell">Reference</th>
              <th className="text-right px-4 py-3 label-text">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {MOCK_PAYMENTS.map(payment => {
              const Icon = methodIcons[payment.paymentMethod] || DollarSign;
              return (
                <tr key={payment.id} className="table-row-hover">
                  <td className="px-4 py-3 text-xs">{formatDate(payment.paymentDate)}</td>
                  <td className="px-4 py-3 text-xs font-medium">{payment.patientName}</td>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground hidden md:table-cell">
                    {payment.claimNumber.split('-').slice(1).join('-')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('badge-status', typeColors[payment.paymentType] || 'text-muted-foreground bg-muted')}>
                      {payment.paymentType}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                      {payment.paymentMethod}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground font-mono hidden lg:table-cell">
                    {payment.eraNumber || payment.checkNumber || '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                    {formatCurrency(payment.amount)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border bg-muted/30">
              <td colSpan={5} className="px-4 py-3 text-sm font-semibold">Total</td>
              <td className="px-4 py-3 text-right font-bold text-lg text-emerald-600 hidden lg:table-cell" colSpan={2}>
                {formatCurrency(stats.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Post Payment Modal */}
      {showPost && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl shadow-2xl w-full max-w-lg">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-bold">Post Payment</h2>
              <button onClick={() => setShowPost(false)} className="text-muted-foreground hover:text-foreground text-xl">✕</button>
            </div>
            <div className="p-5 space-y-4">
              {/* Type Toggle */}
              <div>
                <label className="label-text block mb-2">Payment Type</label>
                <div className="flex gap-2">
                  {(['Insurance', 'Patient'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setPaymentType(t)}
                      className={cn('flex-1 py-2 rounded-md text-sm font-medium transition-colors',
                        paymentType === t ? 'bg-[hsl(var(--primary))] text-white' : 'bg-secondary hover:bg-secondary/70'
                      )}
                    >
                      {t === 'Insurance' ? <><Building2 className="w-4 h-4 inline mr-1.5" />Insurance</> : <><User className="w-4 h-4 inline mr-1.5" />Patient</>}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label-text block mb-1">Patient / Claim</label>
                <select className="select-field">
                  <option>Robert Johnson — CLM-2026-001238</option>
                  <option>Maria Garcia — CLM-2026-001235</option>
                  <option>David Thompson — CLM-2026-001236</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text block mb-1">Payment Date</label>
                  <input type="date" className="input-field" defaultValue="2026-04-28" />
                </div>
                <div>
                  <label className="label-text block mb-1">Amount</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input className="input-field pl-8" placeholder="0.00" type="number" step="0.01" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text block mb-1">Payment Method</label>
                  <select className="select-field">
                    <option>EFT</option>
                    <option>Check</option>
                    <option>Credit Card</option>
                    <option>Cash</option>
                  </select>
                </div>
                <div>
                  <label className="label-text block mb-1">{paymentType === 'Insurance' ? 'ERA Number' : 'Check / Reference #'}</label>
                  <input className="input-field" placeholder={paymentType === 'Insurance' ? 'ERA-...' : 'CHK-...'} />
                </div>
              </div>
              <div>
                <label className="label-text block mb-1">Notes</label>
                <textarea className="input-field h-16 resize-none" placeholder="Optional notes..." />
              </div>
            </div>
            <div className="px-5 pb-5 flex justify-end gap-2">
              <button className="btn-outline" onClick={() => setShowPost(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => { setShowPost(false); toast.success('Payment posted successfully!'); }}>
                Post Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
