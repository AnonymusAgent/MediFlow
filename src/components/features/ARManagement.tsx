import { useState } from 'react';
import { MOCK_AR, MOCK_CLAIMS } from '@/constants/mockData';
import { ARItem } from '@/types';
import { formatCurrency, formatDate, getAgingColor, getClaimStatusColor, cn } from '@/lib/utils';
import { AlertTriangle, Phone, FileText, RotateCcw, TrendingDown, Filter } from 'lucide-react';

const AGING_BUCKETS = ['All', '0-30', '31-60', '61-90', '91-120', '120+'];

export default function ARManagement() {
  const [agingFilter, setAgingFilter] = useState('All');
  const [selectedItem, setSelectedItem] = useState<ARItem | null>(null);

  const allDenied = MOCK_CLAIMS.filter(c => c.status === 'Denied');
  const filtered = MOCK_AR.filter(item =>
    agingFilter === 'All' || item.agingBucket === agingFilter
  );

  const totals = {
    '0-30': MOCK_AR.filter(a => a.agingBucket === '0-30').reduce((s, a) => s + a.balance, 0),
    '31-60': MOCK_AR.filter(a => a.agingBucket === '31-60').reduce((s, a) => s + a.balance, 0),
    '61-90': MOCK_AR.filter(a => a.agingBucket === '61-90').reduce((s, a) => s + a.balance, 0),
    '91-120': MOCK_AR.filter(a => a.agingBucket === '91-120').reduce((s, a) => s + a.balance, 0),
    '120+': MOCK_AR.filter(a => a.agingBucket === '120+').reduce((s, a) => s + a.balance, 0),
  };

  const totalAR = Object.values(totals).reduce((s, v) => s + v, 0);

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold">AR Management & Denial Tracking</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Accounts receivable follow-up and denial resolution</p>
      </div>

      {/* Aging Summary */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="section-title">AR Aging Summary</h3>
          <span className="text-sm font-bold text-[hsl(var(--primary))]">Total AR: {formatCurrency(totalAR)}</span>
        </div>
        <div className="grid grid-cols-5 divide-x divide-border">
          {[
            { label: '0-30 Days', key: '0-30', color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
            { label: '31-60 Days', key: '31-60', color: 'text-yellow-600', bg: 'bg-yellow-50/50' },
            { label: '61-90 Days', key: '61-90', color: 'text-orange-600', bg: 'bg-orange-50/50' },
            { label: '91-120 Days', key: '91-120', color: 'text-red-600', bg: 'bg-red-50/50' },
            { label: '120+ Days', key: '120+', color: 'text-red-800', bg: 'bg-red-100/50' },
          ].map(b => (
            <div key={b.key} className={cn('p-4 text-center', b.bg)}>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{b.label}</p>
              <p className={cn('text-lg font-bold mt-1', b.color)}>{formatCurrency(totals[b.key as keyof typeof totals])}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {totalAR > 0 ? ((totals[b.key as keyof typeof totals] / totalAR) * 100).toFixed(0) : 0}%
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* AR Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            {AGING_BUCKETS.map(b => (
              <button
                key={b}
                onClick={() => setAgingFilter(b)}
                className={cn('px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                  agingFilter === b ? 'bg-[hsl(var(--primary))] text-white' : 'bg-secondary hover:bg-secondary/70'
                )}
              >
                {b === 'All' ? 'All Buckets' : `${b} Days`}
              </button>
            ))}
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 label-text">Patient / Claim</th>
                  <th className="text-left px-4 py-3 label-text hidden md:table-cell">Payer</th>
                  <th className="text-left px-4 py-3 label-text">Aging</th>
                  <th className="text-right px-4 py-3 label-text">Balance</th>
                  <th className="text-left px-4 py-3 label-text">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(item => (
                  <tr
                    key={item.claimId}
                    className="table-row-hover"
                    onClick={() => setSelectedItem(item)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-xs">{item.patientName}</p>
                      <p className="text-[10px] font-mono text-muted-foreground">{item.claimNumber.split('-').slice(1).join('-')}</p>
                      <span className={cn('badge-status border text-[10px] mt-1', getClaimStatusColor(item.status))}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs hidden md:table-cell">{item.payerName}</td>
                    <td className="px-4 py-3">
                      <span className={cn('badge-status', getAgingColor(item.agingBucket))}>
                        {item.agingBucket} days
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-sm text-red-600">
                      {formatCurrency(item.balance)}
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <button className="w-7 h-7 rounded hover:bg-muted flex items-center justify-center" title="Call payer">
                          <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        {item.status === 'Denied' && (
                          <button className="w-7 h-7 rounded hover:bg-muted flex items-center justify-center" title="Appeal">
                            <RotateCcw className="w-3.5 h-3.5 text-orange-500" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">No AR items for this filter.</div>
            )}
          </div>
        </div>

        {/* Right Panel: Denials */}
        <div className="space-y-4">
          <div className="stat-card">
            <h3 className="section-title mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" /> Denial Queue
            </h3>
            <div className="space-y-2">
              {allDenied.map(claim => (
                <div key={claim.id} className="p-3 bg-red-50 border border-red-100 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold">{claim.patientName}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{claim.claimNumber.split('-').slice(1).join('-')}</p>
                    </div>
                    <span className="text-xs font-bold text-red-600">{formatCurrency(claim.balance)}</span>
                  </div>
                  <p className="text-[10px] text-red-600 mt-1.5 flex items-start gap-1">
                    <span className="font-semibold flex-shrink-0">{claim.denialCode}:</span>
                    <span>{claim.denialReason}</span>
                  </p>
                  <div className="flex gap-1.5 mt-2">
                    <button className="text-[10px] bg-white border border-red-200 text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors flex items-center gap-1">
                      <RotateCcw className="w-3 h-3" /> Appeal
                    </button>
                    <button className="text-[10px] bg-white border border-border text-muted-foreground hover:bg-muted px-2 py-1 rounded transition-colors flex items-center gap-1">
                      <FileText className="w-3 h-3" /> Notes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Item Detail */}
          {selectedItem && (
            <div className="stat-card">
              <h3 className="section-title mb-3">AR Detail</h3>
              <div className="space-y-2.5">
                {[
                  ['Patient', selectedItem.patientName],
                  ['Payer', selectedItem.payerName],
                  ['DOS', formatDate(selectedItem.dateOfService)],
                  ['Total Charges', formatCurrency(selectedItem.totalCharges)],
                  ['Balance', formatCurrency(selectedItem.balance)],
                  ['Last Action', selectedItem.lastAction || '—'],
                  ['Last Action Date', selectedItem.lastActionDate ? formatDate(selectedItem.lastActionDate) : '—'],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{l}</span>
                    <span className="font-medium text-right max-w-[60%]">{v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-border space-y-1.5">
                <button className="w-full btn-primary text-xs justify-center py-2">Follow Up</button>
                <button className="w-full btn-outline text-xs justify-center py-2">Add Note</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
