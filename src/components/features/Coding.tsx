import { useState } from 'react';
import { CPT_CODES, ICD10_CODES } from '@/constants/mockData';
import { formatCurrency, cn } from '@/lib/utils';
import { Search, BookOpen, CheckCircle, Lightbulb, Code } from 'lucide-react';

export default function Coding() {
  const [dxSearch, setDxSearch] = useState('');
  const [cptSearch, setCptSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'icd10' | 'cpt' | 'tips'>('icd10');

  const filteredDx = ICD10_CODES.filter(d =>
    !dxSearch || d.code.toLowerCase().includes(dxSearch.toLowerCase()) ||
    d.description.toLowerCase().includes(dxSearch.toLowerCase())
  );

  const filteredCpt = CPT_CODES.filter(c =>
    !cptSearch || c.code.toLowerCase().includes(cptSearch.toLowerCase()) ||
    c.description.toLowerCase().includes(cptSearch.toLowerCase())
  );

  const codingTips = [
    { title: 'Specificity First', desc: 'Always use the most specific ICD-10 code available. Avoid "unspecified" codes when clinical documentation supports a more specific code.', type: 'rule' },
    { title: 'Medical Necessity', desc: 'Ensure the diagnosis code justifies the procedure code (CPT). Payers deny claims when there is no clear medical necessity link.', type: 'warning' },
    { title: 'Modifier 25', desc: 'Append modifier 25 to E&M codes when a significant, separately identifiable E&M service is provided on the same day as a procedure.', type: 'tip' },
    { title: 'Medicare Preventive vs. Diagnostic', desc: 'When a wellness visit transitions to a problem-focused visit, bill both codes with modifier 25. Patient cost-sharing applies only to the diagnostic portion.', type: 'tip' },
    { title: 'Units vs. Multiple Codes', desc: 'For repeated identical services, use units field rather than billing the same code multiple times on separate lines.', type: 'rule' },
    { title: 'HIPAA Compliance', desc: 'All medical coding must use ICD-10-CM, CPT-4, and HCPCS Level II code sets as mandated by HIPAA Administrative Simplification standards.', type: 'compliance' },
  ];

  const tipColors: Record<string, string> = {
    rule: 'border-blue-400 bg-blue-50',
    warning: 'border-orange-400 bg-orange-50',
    tip: 'border-teal-400 bg-teal-50',
    compliance: 'border-purple-400 bg-purple-50',
  };

  const tipIcons: Record<string, React.ElementType> = {
    rule: BookOpen,
    warning: Code,
    tip: Lightbulb,
    compliance: CheckCircle,
  };

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Coding & Compliance</h1>
        <p className="text-sm text-muted-foreground mt-0.5">ICD-10, CPT lookup and coding guidelines</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'icd10' as const, label: 'ICD-10 Lookup' },
          { id: 'cpt' as const, label: 'CPT / HCPCS' },
          { id: 'tips' as const, label: 'Coding Guidelines' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              activeTab === t.id
                ? 'bg-[hsl(var(--primary))] text-white'
                : 'bg-card border border-border hover:bg-muted'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ICD-10 Tab */}
      {activeTab === 'icd10' && (
        <div className="space-y-4">
          <div className="relative max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              className="input-field pl-9"
              placeholder="Search by ICD-10 code or diagnosis description..."
              value={dxSearch}
              onChange={e => setDxSearch(e.target.value)}
            />
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 label-text w-32">ICD-10 Code</th>
                  <th className="text-left px-4 py-3 label-text">Description</th>
                  <th className="text-left px-4 py-3 label-text hidden md:table-cell">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredDx.map(code => (
                  <tr key={code.code} className="table-row-hover">
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-[hsl(var(--primary))] text-sm">{code.code}</span>
                    </td>
                    <td className="px-4 py-3 text-sm">{code.description}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
                      {code.code.startsWith('I') ? 'Circulatory' :
                       code.code.startsWith('E') ? 'Endocrine' :
                       code.code.startsWith('J') ? 'Respiratory' :
                       code.code.startsWith('M') ? 'Musculoskeletal' :
                       code.code.startsWith('F') ? 'Mental Health' :
                       code.code.startsWith('K') ? 'Digestive' :
                       code.code.startsWith('N') ? 'Genitourinary' :
                       code.code.startsWith('Z') ? 'Factors Influencing Health' :
                       code.code.startsWith('R') ? 'Symptoms & Signs' : 'Other'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredDx.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">No codes found.</div>
            )}
          </div>
        </div>
      )}

      {/* CPT Tab */}
      {activeTab === 'cpt' && (
        <div className="space-y-4">
          <div className="relative max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              className="input-field pl-9"
              placeholder="Search by CPT code or procedure description..."
              value={cptSearch}
              onChange={e => setCptSearch(e.target.value)}
            />
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 label-text w-28">CPT Code</th>
                  <th className="text-left px-4 py-3 label-text">Description</th>
                  <th className="text-right px-4 py-3 label-text w-28">Standard Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCpt.map(code => (
                  <tr key={code.code} className="table-row-hover">
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-emerald-700 text-sm">{code.code}</span>
                    </td>
                    <td className="px-4 py-3 text-sm">{code.description}</td>
                    <td className="px-4 py-3 text-right font-semibold text-sm text-[hsl(var(--primary))]">
                      {formatCurrency(code.fee)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredCpt.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">No codes found.</div>
            )}
          </div>
        </div>
      )}

      {/* Tips Tab */}
      {activeTab === 'tips' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {codingTips.map(tip => {
            const Icon = tipIcons[tip.type];
            return (
              <div key={tip.title} className={cn('border-l-4 rounded-lg p-4', tipColors[tip.type])}>
                <div className="flex items-start gap-3">
                  <Icon className="w-4 h-4 mt-0.5 flex-shrink-0 text-current opacity-70" />
                  <div>
                    <h4 className="font-semibold text-sm">{tip.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{tip.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
