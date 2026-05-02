import { useState } from 'react';
import { MOCK_PATIENTS, MOCK_APPOINTMENTS, MOCK_CLAIMS } from '@/constants/mockData';
import { formatDate, formatDateTime, cn } from '@/lib/utils';
import {
  Plus, Search, FileText, Clock, User, Link, ChevronDown, ChevronUp,
  CheckCircle, Edit3, Printer, Save, X, BookOpen, Stethoscope
} from 'lucide-react';
import { toast } from 'sonner';

interface SOAPNote {
  id: string;
  patientId: string;
  patientName: string;
  providerId: string;
  providerName: string;
  appointmentId?: string;
  claimId?: string;
  dateOfService: string;
  createdAt: string;
  status: 'Draft' | 'Signed' | 'Amended';
  templateUsed?: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

const NOTE_TEMPLATES: Record<string, Partial<SOAPNote>> = {
  'Annual Wellness': {
    templateUsed: 'Annual Wellness',
    subjective: "Patient presents for annual wellness examination. Patient reports feeling generally well. No acute complaints. Reviews medications, denies new symptoms. Last visit was 12 months ago.",
    objective: "Vitals: BP 128/82 mmHg, HR 72 bpm, RR 16/min, T 98.6°F, SpO2 98% RA, Wt 185 lbs, Ht 5'11\".\nGeneral: Well-nourished, well-developed, no acute distress.\nHEENT: Normocephalic, atraumatic. PERRL. TMs intact bilaterally.\nCardiovascular: RRR, no murmurs, rubs, or gallops.\nRespiratory: CTA bilaterally, no wheezes or crackles.\nAbdomen: Soft, non-tender, no organomegaly.\nExtremities: No edema. Pulses 2+ bilaterally.",
    assessment: "1. Health maintenance exam — patient at goal weight, BP within acceptable range.\n2. No new conditions identified.",
    plan: "1. Continue current medications as prescribed.\n2. Order routine labs: CBC, CMP, lipid panel, HbA1c.\n3. Schedule flu vaccine.\n4. Return to clinic in 12 months or sooner if concerns arise.\n5. Patient counseled on diet, exercise, and preventive screenings.",
  },
  'Hypertension Follow-up': {
    templateUsed: 'Hypertension Follow-up',
    subjective: "Patient presents for hypertension follow-up. Reports compliance with antihypertensive medications. Denies headaches, visual changes, chest pain, or shortness of breath. Blood pressure monitoring at home has been [within/above] goal.",
    objective: "Vitals: BP [systolic]/[diastolic] mmHg (left arm, seated), HR [rate] bpm.\nGeneral: No acute distress.\nCardiovascular: RRR, no murmurs.\nFundi: Not examined today.",
    assessment: "1. Essential hypertension — [controlled/uncontrolled] on current regimen.\n2. [Add secondary diagnosis if applicable].",
    plan: "1. [Continue/Adjust] current antihypertensive regimen.\n2. Lifestyle counseling: sodium restriction < 2g/day, DASH diet, aerobic exercise 150 min/week.\n3. Order BMP to monitor renal function and electrolytes.\n4. Follow-up in [4-12] weeks.",
  },
  'Diabetes Follow-up': {
    templateUsed: 'Diabetes Follow-up',
    subjective: "Patient presents for diabetes management. Reports [compliance/non-compliance] with medications. Blood glucose monitoring at home: fasting values averaging [value] mg/dL. Denies hypoglycemic episodes, polyuria, polydipsia. Last HbA1c was [value]%.",
    objective: "Vitals: BP [value] mmHg, Wt [value] lbs (change from last visit: [+/-] [value] lbs).\nFeet: Sensation intact bilateral, no ulcerations, pulses 2+ DP/PT.\nSkin: No acanthosis nigricans.",
    assessment: "1. Type 2 diabetes mellitus — [controlled/poorly controlled], HbA1c [value]%.\n2. [Hypertension/Hyperlipidemia if present].",
    plan: "1. [Continue/Adjust] metformin [dose] mg BID.\n2. Order HbA1c, CMP, urine microalbumin.\n3. Ophthalmology referral if not seen in past 12 months.\n4. Podiatry referral for annual foot exam.\n5. Return in 3 months.",
  },
  'Chest Pain Evaluation': {
    templateUsed: 'Chest Pain Evaluation',
    subjective: "Patient presents with chest pain. Onset: [acute/gradual]. Character: [sharp/dull/pressure/burning]. Location: [substernal/left-sided/diffuse]. Radiation: [jaw/left arm/back/none]. Duration: [duration]. Aggravating factors: [exertion/rest]. Relieving factors: [rest/nitroglycerin/antacids]. Associated symptoms: [diaphoresis/dyspnea/nausea/palpitations].",
    objective: "Vitals: BP [value] mmHg, HR [rate] bpm, RR [rate], SpO2 [value]% RA.\nGeneral: [comfortable/distressed].\nCardiovascular: RRR, [murmurs if present].\nRespiratory: [breath sounds].\nEKG: [normal sinus rhythm/ST changes/other].",
    assessment: "1. Chest pain — etiology [ACS/musculoskeletal/GERD/anxiety/unclear] pending workup.\n2. [Secondary diagnoses].",
    plan: "1. [Admit/Discharge/Observe] patient.\n2. Troponin series q3-6h.\n3. Cardiology consult.\n4. Aspirin 325mg if not contraindicated.\n5. Follow-up in [timeframe].",
  },
};

const MOCK_NOTES: SOAPNote[] = [
  {
    id: 'note001', patientId: 'p001', patientName: 'Robert Johnson',
    providerId: 'u1', providerName: 'Dr. Sarah Mitchell',
    appointmentId: 'a001', claimId: 'c001',
    dateOfService: '2026-04-15', createdAt: '2026-04-15T10:30:00Z',
    status: 'Signed', templateUsed: 'Hypertension Follow-up',
    subjective: "Patient presents for hypertension follow-up. Reports compliance with lisinopril 10mg daily. Denies headaches, visual changes, chest pain, or shortness of breath. Home BP monitoring averaging 132/84 mmHg.",
    objective: "Vitals: BP 134/86 mmHg (left arm, seated), HR 76 bpm.\nGeneral: No acute distress.\nCardiovascular: RRR, no murmurs.",
    assessment: "1. Essential hypertension — controlled on current regimen.\n2. Hyperlipidemia — on statin therapy.",
    plan: "1. Continue lisinopril 10mg daily.\n2. Continue atorvastatin 20mg nightly.\n3. Sodium restriction counseling provided.\n4. Order BMP to monitor renal function.\n5. Follow-up in 3 months.",
  },
  {
    id: 'note002', patientId: 'p002', patientName: 'Maria Garcia',
    providerId: 'u5', providerName: 'Dr. Michael Torres',
    appointmentId: 'a002', claimId: 'c002',
    dateOfService: '2026-04-18', createdAt: '2026-04-18T09:45:00Z',
    status: 'Signed', templateUsed: 'Chest Pain Evaluation',
    subjective: "Patient presents with chest pain. Onset: acute, began 2 days ago. Character: pressure-like. Location: substernal. Radiation: left arm and jaw. Duration: 20-30 minutes. Aggravating factors: exertion. Relieving factors: rest. Associated symptoms: mild dyspnea.",
    objective: "Vitals: BP 148/92 mmHg, HR 88 bpm, RR 18, SpO2 97% RA.\nGeneral: Mild distress.\nCardiovascular: RRR, no murmurs.\nEKG: ST depression V4-V6.",
    assessment: "1. Chest pain — high suspicion for ACS given clinical presentation.\n2. Atherosclerotic heart disease — known history.",
    plan: "1. Admit to cardiac unit for monitoring.\n2. Troponin series q3h.\n3. Cardiology consult placed.\n4. Aspirin 325mg given.\n5. Echocardiogram ordered.",
  },
  {
    id: 'note003', patientId: 'p004', patientName: 'Jennifer Williams',
    providerId: 'u5', providerName: 'Dr. Michael Torres',
    dateOfService: '2026-04-22', createdAt: '2026-04-22T11:00:00Z',
    status: 'Draft', templateUsed: 'Annual Wellness',
    subjective: "Patient presents for annual wellness examination. Reports feeling generally well. No acute complaints.",
    objective: "Vitals: BP 118/76 mmHg, HR 68 bpm, T 98.4°F, SpO2 99% RA, Wt 142 lbs.",
    assessment: "1. Health maintenance exam — patient in excellent health.",
    plan: "1. Continue healthy lifestyle.\n2. Order routine labs.\n3. Return in 12 months.",
  },
];

interface NoteEditorProps {
  note: Partial<SOAPNote>;
  onSave: (note: SOAPNote) => void;
  onClose: () => void;
}

function NoteEditor({ note, onSave, onClose }: NoteEditorProps) {
  const [form, setForm] = useState({
    patientId: note.patientId || '',
    appointmentId: note.appointmentId || '',
    claimId: note.claimId || '',
    dateOfService: note.dateOfService || new Date().toISOString().split('T')[0],
    subjective: note.subjective || '',
    objective: note.objective || '',
    assessment: note.assessment || '',
    plan: note.plan || '',
  });
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [activeSection, setActiveSection] = useState<'S' | 'O' | 'A' | 'P'>('S');

  const applyTemplate = (tpl: string) => {
    const t = NOTE_TEMPLATES[tpl];
    if (!t) return;
    setForm(f => ({
      ...f,
      subjective: t.subjective || f.subjective,
      objective: t.objective || f.objective,
      assessment: t.assessment || f.assessment,
      plan: t.plan || f.plan,
    }));
    setSelectedTemplate(tpl);
    toast.success(`Template "${tpl}" applied`);
  };

  const selectedPatient = MOCK_PATIENTS.find(p => p.id === form.patientId);

  const handleSave = (status: 'Draft' | 'Signed') => {
    if (!form.patientId) { toast.error('Please select a patient'); return; }
    if (!form.subjective.trim()) { toast.error('Subjective section is required'); return; }
    const saved: SOAPNote = {
      id: note.id || `note${Date.now()}`,
      patientId: form.patientId,
      patientName: selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : '',
      providerId: 'u1',
      providerName: 'Dr. Sarah Mitchell',
      appointmentId: form.appointmentId || undefined,
      claimId: form.claimId || undefined,
      dateOfService: form.dateOfService,
      createdAt: note.createdAt || new Date().toISOString(),
      status,
      templateUsed: selectedTemplate || note.templateUsed,
      subjective: form.subjective,
      objective: form.objective,
      assessment: form.assessment,
      plan: form.plan,
    };
    onSave(saved);
    toast.success(status === 'Signed' ? 'Note signed and locked.' : 'Note saved as draft.');
  };

  const sections = [
    { key: 'S' as const, label: 'Subjective', field: 'subjective' as const, hint: "Patient's reported symptoms, history, and chief complaint" },
    { key: 'O' as const, label: 'Objective', field: 'objective' as const, hint: 'Vitals, physical exam findings, lab results, and observations' },
    { key: 'A' as const, label: 'Assessment', field: 'assessment' as const, hint: 'Diagnoses, differential diagnoses, and clinical impressions' },
    { key: 'P' as const, label: 'Plan', field: 'plan' as const, hint: 'Treatment orders, medications, referrals, and follow-up instructions' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-[hsl(var(--primary))] px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <Stethoscope className="w-5 h-5 text-white" />
            <div>
              <h2 className="text-white font-bold text-lg">{note.id ? 'Edit' : 'New'} SOAP Note</h2>
              <p className="text-white/70 text-xs">{selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : 'Select a patient'}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left: Visit Info + Template */}
          <div className="w-64 border-r border-border p-4 space-y-4 overflow-y-auto flex-shrink-0 bg-muted/20">
            <div>
              <label className="label-text block mb-1">Patient *</label>
              <select className="select-field text-xs" value={form.patientId} onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))}>
                <option value="">Select patient...</option>
                {MOCK_PATIENTS.map(p => (
                  <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-text block mb-1">Date of Service</label>
              <input type="date" className="input-field text-xs" value={form.dateOfService} onChange={e => setForm(f => ({ ...f, dateOfService: e.target.value }))} />
            </div>
            <div>
              <label className="label-text block mb-1">Link to Appointment</label>
              <select className="select-field text-xs" value={form.appointmentId} onChange={e => setForm(f => ({ ...f, appointmentId: e.target.value }))}>
                <option value="">None</option>
                {MOCK_APPOINTMENTS.filter(a => !form.patientId || a.patientId === form.patientId).map(a => (
                  <option key={a.id} value={a.id}>{a.date} {a.time} — {a.type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-text block mb-1">Link to Claim</label>
              <select className="select-field text-xs" value={form.claimId} onChange={e => setForm(f => ({ ...f, claimId: e.target.value }))}>
                <option value="">None</option>
                {MOCK_CLAIMS.filter(c => !form.patientId || c.patientId === form.patientId).map(c => (
                  <option key={c.id} value={c.id}>{c.claimNumber.split('-').slice(1).join('-')}</option>
                ))}
              </select>
            </div>

            {/* Templates */}
            <div>
              <label className="label-text block mb-2">Note Templates</label>
              <div className="space-y-1">
                {Object.keys(NOTE_TEMPLATES).map(tpl => (
                  <button
                    key={tpl}
                    onClick={() => applyTemplate(tpl)}
                    className={cn(
                      'w-full text-left text-xs px-2.5 py-2 rounded-md transition-colors flex items-center gap-2',
                      selectedTemplate === tpl
                        ? 'bg-[hsl(var(--teal))]/20 text-[hsl(var(--teal))] font-medium'
                        : 'hover:bg-muted text-muted-foreground'
                    )}
                  >
                    <BookOpen className="w-3 h-3 flex-shrink-0" />
                    {tpl}
                  </button>
                ))}
              </div>
            </div>

            {/* SOAP Section Nav */}
            <div>
              <label className="label-text block mb-2">Jump to Section</label>
              <div className="space-y-1">
                {sections.map(s => (
                  <button
                    key={s.key}
                    onClick={() => setActiveSection(s.key)}
                    className={cn(
                      'w-full text-left text-xs px-2.5 py-2 rounded-md transition-colors font-medium',
                      activeSection === s.key
                        ? 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]'
                        : 'hover:bg-muted text-muted-foreground'
                    )}
                  >
                    <span className="font-bold">{s.key}</span> — {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: SOAP Editor */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {sections.map(section => (
              <div
                key={section.key}
                id={`section-${section.key}`}
                className={cn(
                  'rounded-lg border-2 transition-colors',
                  activeSection === section.key ? 'border-[hsl(var(--teal))]' : 'border-border'
                )}
              >
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer"
                  onClick={() => setActiveSection(section.key)}
                >
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold',
                      activeSection === section.key
                        ? 'bg-[hsl(var(--teal))] text-white'
                        : 'bg-muted text-muted-foreground'
                    )}>
                      {section.key}
                    </span>
                    <div>
                      <p className="font-semibold text-sm">{section.label}</p>
                      <p className="text-xs text-muted-foreground">{section.hint}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {form[section.field]?.length || 0} chars
                  </span>
                </div>
                <div className="px-4 pb-4">
                  <textarea
                    value={form[section.field]}
                    onChange={e => setForm(f => ({ ...f, [section.field]: e.target.value }))}
                    onClick={() => setActiveSection(section.key)}
                    rows={activeSection === section.key ? 7 : 3}
                    placeholder={`Enter ${section.label.toLowerCase()} findings...`}
                    className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(var(--teal))]/30 focus:border-[hsl(var(--teal))] transition-all resize-none leading-relaxed font-mono"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-3 flex items-center justify-between flex-shrink-0 bg-muted/20">
          <div className="text-xs text-muted-foreground flex items-center gap-4">
            {selectedTemplate && <span className="flex items-center gap-1.5"><BookOpen className="w-3 h-3" /> Template: {selectedTemplate}</span>}
            {form.appointmentId && <span className="flex items-center gap-1.5"><Link className="w-3 h-3" /> Appointment linked</span>}
            {form.claimId && <span className="flex items-center gap-1.5"><FileText className="w-3 h-3" /> Claim linked</span>}
          </div>
          <div className="flex gap-2">
            <button className="btn-outline" onClick={onClose}>Cancel</button>
            <button className="btn-secondary" onClick={() => handleSave('Draft')}>
              <Save className="w-4 h-4" /> Save Draft
            </button>
            <button className="btn-primary" onClick={() => handleSave('Signed')}>
              <CheckCircle className="w-4 h-4" /> Sign & Lock
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClinicalNotes() {
  const [notes, setNotes] = useState<SOAPNote[]>(MOCK_NOTES);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showEditor, setShowEditor] = useState(false);
  const [editNote, setEditNote] = useState<Partial<SOAPNote>>({});
  const [expandedNote, setExpandedNote] = useState<string | null>(null);

  const filtered = notes.filter(n => {
    const matchSearch = `${n.patientName} ${n.providerName} ${n.templateUsed || ''}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || n.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSave = (note: SOAPNote) => {
    setNotes(prev => {
      const existing = prev.find(n => n.id === note.id);
      if (existing) return prev.map(n => n.id === note.id ? note : n);
      return [note, ...prev];
    });
    setShowEditor(false);
    setEditNote({});
  };

  return (
    <div className="p-6 space-y-5">
      {showEditor && (
        <NoteEditor
          note={editNote}
          onSave={handleSave}
          onClose={() => { setShowEditor(false); setEditNote({}); }}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clinical Notes (EHR)</h1>
          <p className="text-sm text-muted-foreground mt-0.5">SOAP note documentation per patient visit</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => { setEditNote({}); setShowEditor(true); }}
        >
          <Plus className="w-4 h-4" /> New SOAP Note
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Notes', value: notes.length, color: 'text-[hsl(var(--primary))]' },
          { label: 'Signed', value: notes.filter(n => n.status === 'Signed').length, color: 'text-emerald-600' },
          { label: 'Drafts', value: notes.filter(n => n.status === 'Draft').length, color: 'text-yellow-600' },
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
          <input className="input-field pl-9" placeholder="Search notes..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {['All', 'Draft', 'Signed', 'Amended'].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn('px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              statusFilter === s ? 'bg-[hsl(var(--primary))] text-white' : 'bg-secondary text-secondary-foreground hover:bg-secondary/70'
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Notes List */}
      <div className="space-y-3">
        {filtered.map(note => {
          const isExpanded = expandedNote === note.id;
          return (
            <div key={note.id} className="bg-card border border-border rounded-lg overflow-hidden">
              {/* Note Header */}
              <div
                className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-muted/20 transition-colors"
                onClick={() => setExpandedNote(isExpanded ? null : note.id)}
              >
                <div className={cn(
                  'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
                  note.status === 'Signed' ? 'bg-emerald-50' : 'bg-yellow-50'
                )}>
                  <Stethoscope className={cn('w-4 h-4', note.status === 'Signed' ? 'text-emerald-600' : 'text-yellow-600')} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm">{note.patientName}</p>
                    {note.templateUsed && (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{note.templateUsed}</span>
                    )}
                    {note.appointmentId && <span className="text-[10px] text-blue-600 flex items-center gap-1"><Link className="w-2.5 h-2.5" />Appt</span>}
                    {note.claimId && <span className="text-[10px] text-purple-600 flex items-center gap-1"><FileText className="w-2.5 h-2.5" />Claim</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><User className="w-3 h-3" />{note.providerName}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(note.dateOfService)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={cn('badge-status',
                    note.status === 'Signed' ? 'text-emerald-700 bg-emerald-50' :
                    note.status === 'Draft' ? 'text-yellow-700 bg-yellow-50' : 'text-blue-700 bg-blue-50'
                  )}>
                    {note.status === 'Signed' ? <><CheckCircle className="w-3 h-3" /> Signed</> : note.status}
                  </span>
                  {note.status === 'Draft' && (
                    <button
                      onClick={e => { e.stopPropagation(); setEditNote(note); setShowEditor(true); }}
                      className="w-7 h-7 rounded hover:bg-muted flex items-center justify-center"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  )}
                  <button className="w-7 h-7 rounded hover:bg-muted flex items-center justify-center" onClick={e => e.stopPropagation()}>
                    <Printer className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </div>

              {/* Expanded SOAP Content */}
              {isExpanded && (
                <div className="border-t border-border grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-border">
                  {[
                    { key: 'S', label: 'Subjective', content: note.subjective, color: 'bg-blue-50' },
                    { key: 'O', label: 'Objective', content: note.objective, color: 'bg-teal-50' },
                    { key: 'A', label: 'Assessment', content: note.assessment, color: 'bg-orange-50' },
                    { key: 'P', label: 'Plan', content: note.plan, color: 'bg-purple-50' },
                  ].map(section => (
                    <div key={section.key} className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={cn('w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white',
                          section.key === 'S' ? 'bg-blue-500' :
                          section.key === 'O' ? 'bg-teal-500' :
                          section.key === 'A' ? 'bg-orange-500' : 'bg-purple-500'
                        )}>
                          {section.key}
                        </span>
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{section.label}</span>
                      </div>
                      <p className="text-xs text-foreground leading-relaxed whitespace-pre-line">{section.content || '—'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 text-border" />
            <p className="text-sm">No clinical notes found.</p>
            <button className="btn-primary mt-4 mx-auto" onClick={() => { setEditNote({}); setShowEditor(true); }}>
              <Plus className="w-4 h-4" /> Create First Note
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
