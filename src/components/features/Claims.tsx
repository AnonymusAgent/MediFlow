import { useState } from 'react';
import { MOCK_CLAIMS } from '@/constants/mockData';
import { Claim } from '@/types';
import { formatCurrency, formatDate, getClaimStatusColor, cn } from '@/lib/utils';
import { Search, Plus, Filter, Send, Eye, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface ClaimDetailProps {
  claim: Claim;
  onClose: () => void;
}

function ClaimDetail({ claim, onClose }: ClaimDetailProps) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-[hsl(var(--primary))] p-5 text-white flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold">{claim.claimNumber}</h2>
            <p className="text-white/80 text-sm mt-0.5">{claim.patientName} • {claim.payerName}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={cn('badge-status border text-xs', getClaimStatusColor(claim.status))}>{claim.status}</span>
            <button onClick={onClose} className="text-white/70 hover:text-white text-xl font-light ml-2">✕</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Claim Summary */}
          <div className="grid grid-cols-3 gap-4">
            {[
              ['Date of Service', formatDate(claim.dateOfService)],
              ['Submitted Date', claim.submittedDate ? formatDate(claim.submittedDate) : 'Not submitted'],
              ['Provider', claim.providerName],
            ].map(([l, v]) => (
              <div key={l}>
                <p className="label-text">{l}</p>
                <p className="text-sm font-medium mt-0.5">{v}</p>
              </div>
            ))}
          </div>

          {/* Scrub Errors */}
          {claim.scrubErrors && claim.scrubErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-red-700 flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4" /> Scrub Errors ({claim.scrubErrors.length})
              </h4>
              {claim.scrubErrors.map((err, i) => (
                <p key={i} className="text-xs text-red-600 flex items-start gap-2 mt-1">
                  <XCircle className="w-3 h-3 mt-0.5 flex-shrink-0" /> {err}
                </p>
              ))}
            </div>
          )}

          {/* Denial Info */}
          {claim.denialReason && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-orange-700 mb-1">Denial Information</h4>
              <p className="text-xs text-orange-600">Code: {claim.denialCode}</p>
              <p className="text-xs text-orange-600 mt-0.5">{claim.denialReason}</p>
            </div>
          )}

          {/* Diagnosis Codes */}
          <div>
            <h4 className="section-title mb-2">Diagnosis Codes (ICD-10)</h4>
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="text-left px-3 py-2 label-text">Code</th>
                    <th className="text-left px-3 py-2 label-text">Description</th>
                    <th className="text-left px-3 py-2 label-text">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {claim.diagnosisCodes.map((dx) => (
                    <tr key={dx.code}>
                      <td className="px-3 py-2 font-mono text-xs font-semibold text-[hsl(var(--primary))]">{dx.code}</td>
                      <td className="px-3 py-2 text-xs">{dx.description}</td>
                      <td className="px-3 py-2">
                        <span className={cn('badge-status text-xs',
                          dx.type === 'Primary' ? 'text-[hsl(var(--primary))] bg-blue-50' : 'text-muted-foreground bg-muted'
                        )}>
                          {dx.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Procedure Codes */}
          <div>
            <h4 className="section-title mb-2">Procedure Codes (CPT)</h4>
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="text-left px-3 py-2 label-text">CPT</th>
                    <th className="text-left px-3 py-2 label-text">Description</th>
                    <th className="text-right px-3 py-2 label-text">Units</th>
                    <th className="text-right px-3 py-2 label-text">Charge</th>
                    <th className="text-right px-3 py-2 label-text">Allowed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {claim.procedureCodes.map((px) => (
                    <tr key={px.code}>
                      <td className="px-3 py-2 font-mono text-xs font-semibold text-emerald-700">{px.code}</td>
                      <td className="px-3 py-2 text-xs">{px.description}</td>
                      <td className="px-3 py-2 text-right text-xs">{px.units}</td>
                      <td className="px-3 py-2 text-right text-xs font-medium">{formatCurrency(px.chargeAmount)}</td>
                      <td className="px-3 py-2 text-right text-xs">{px.allowedAmount ? formatCurrency(px.allowedAmount) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="section-title mb-3">Financial Summary</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                ['Total Charges', formatCurrency(claim.totalCharges)],
                ['Allowed Amount', claim.allowedAmount ? formatCurrency(claim.allowedAmount) : '—'],
                ['Adjustments', claim.adjustments ? formatCurrency(claim.adjustments) : '—'],
                ['Insurance Paid', claim.paidAmount ? formatCurrency(claim.paidAmount) : '—'],
                ['Patient Responsibility', claim.patientResponsibility ? formatCurrency(claim.patientResponsibility) : '—'],
                ['Balance Due', formatCurrency(claim.balance)],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{l}</span>
                  <span className={cn('font-semibold', l === 'Balance Due' && claim.balance > 0 ? 'text-red-600' : '')}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border px-5 py-3 flex justify-between">
          <div className="flex gap-2">
            {claim.status === 'Denied' && (
              <button className="btn-secondary text-orange-600">File Appeal</button>
            )}
            {(claim.status === 'Draft' || claim.status === 'Ready to Submit') && (
              <button className="btn-secondary text-green-600">Submit Claim</button>
            )}
          </div>
          <div className="flex gap-2">
            <button className="btn-outline" onClick={onClose}>Close</button>
            <button className="btn-primary"><Eye className="w-4 h-4" /> Print EOB</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Claims() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);

  const STATUSES = ['All', 'Draft', 'Ready to Submit', 'Submitted', 'Pending', 'Paid', 'Partially Paid', 'Denied', 'Appealed'];

  const filtered = MOCK_CLAIMS.filter(c => {
    const matchSearch = `${c.patientName} ${c.claimNumber} ${c.payerName}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: MOCK_CLAIMS.length,
    totalCharges: MOCK_CLAIMS.reduce((s, c) => s + c.totalCharges, 0),
    totalBalance: MOCK_CLAIMS.reduce((s, c) => s + c.balance, 0),
    denied: MOCK_CLAIMS.filter(c => c.status === 'Denied').length,
  };

  return (
    <div className="p-6 space-y-5">
      {selectedClaim && <ClaimDetail claim={selectedClaim} onClose={() => setSelectedClaim(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Claims Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track, scrub, and submit insurance claims</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline"><Send className="w-4 h-4" /> Submit Batch</button>
          <button className="btn-primary"><Plus className="w-4 h-4" /> New Claim</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Claims', value: stats.total.toString(), color: 'text-[hsl(var(--primary))]' },
          { label: 'Total Charges', value: formatCurrency(stats.totalCharges), color: 'text-foreground' },
          { label: 'Outstanding Balance', value: formatCurrency(stats.totalBalance), color: 'text-orange-600' },
          { label: 'Denied Claims', value: stats.denied.toString(), color: 'text-red-600' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <p className="label-text">{s.label}</p>
            <p className={cn('text-xl font-bold mt-1', s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search claims..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn('px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                statusFilter === s
                  ? 'bg-[hsl(var(--primary))] text-white'
                  : 'bg-secondary hover:bg-secondary/70 text-secondary-foreground'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Claims Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left px-4 py-3 label-text">Claim #</th>
              <th className="text-left px-4 py-3 label-text">Patient</th>
              <th className="text-left px-4 py-3 label-text hidden md:table-cell">Payer</th>
              <th className="text-left px-4 py-3 label-text hidden md:table-cell">DOS</th>
              <th className="text-right px-4 py-3 label-text">Charges</th>
              <th className="text-right px-4 py-3 label-text hidden lg:table-cell">Balance</th>
              <th className="text-left px-4 py-3 label-text">Status</th>
              <th className="text-left px-4 py-3 label-text">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(claim => (
              <tr key={claim.id} className="table-row-hover" onClick={() => setSelectedClaim(claim)}>
                <td className="px-4 py-3">
                  <p className="text-xs font-mono font-semibold text-[hsl(var(--primary))]">{claim.claimNumber.split('-').slice(1).join('-')}</p>
                  {claim.scrubErrors && claim.scrubErrors.length > 0 && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <AlertCircle className="w-3 h-3 text-red-500" />
                      <span className="text-[10px] text-red-500">{claim.scrubErrors.length} error(s)</span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-xs">{claim.patientName}</p>
                  <p className="text-[10px] text-muted-foreground">{claim.providerName.split(' ').slice(-1)}</p>
                </td>
                <td className="px-4 py-3 text-xs hidden md:table-cell">{claim.payerName}</td>
                <td className="px-4 py-3 text-xs hidden md:table-cell">{formatDate(claim.dateOfService)}</td>
                <td className="px-4 py-3 text-right text-xs font-medium">{formatCurrency(claim.totalCharges)}</td>
                <td className="px-4 py-3 text-right text-xs hidden lg:table-cell">
                  <span className={claim.balance > 0 ? 'text-red-600 font-semibold' : 'text-emerald-600'}>
                    {formatCurrency(claim.balance)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn('badge-status border', getClaimStatusColor(claim.status))}>
                    {claim.status}
                  </span>
                </td>
                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => setSelectedClaim(claim)}
                    className="w-7 h-7 rounded hover:bg-muted flex items-center justify-center"
                  >
                    <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">No claims found.</div>
        )}
      </div>
    </div>
  );
}
