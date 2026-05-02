import { useState } from 'react';
import { MOCK_PATIENTS, MOCK_APPOINTMENTS } from '@/constants/mockData';
import { formatDate, cn } from '@/lib/utils';
import {
  Plus, Search, Pill, AlertTriangle, CheckCircle, Printer, X,
  Clock, User, FileText, ChevronDown, ChevronUp, Shield
} from 'lucide-react';
import { toast } from 'sonner';

interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  providerId: string;
  providerName: string;
  appointmentId?: string;
  prescribedDate: string;
  status: 'Active' | 'Cancelled' | 'Completed' | 'On Hold';
  drugName: string;
  genericName: string;
  strength: string;
  form: 'Tablet' | 'Capsule' | 'Liquid' | 'Injection' | 'Patch' | 'Inhaler' | 'Drops' | 'Cream';
  dosage: string;
  frequency: string;
  route: string;
  quantity: number;
  refills: number;
  daysSupply: number;
  instructions: string;
  dea?: string;
  controlled: boolean;
  interactions?: string[];
}

interface Drug {
  name: string;
  generic: string;
  strengths: string[];
  forms: string[];
  controlled: boolean;
  dea?: string;
  commonInteractions: string[];
}

const DRUG_DATABASE: Drug[] = [
  { name: 'Lisinopril', generic: 'lisinopril', strengths: ['2.5mg', '5mg', '10mg', '20mg', '40mg'], forms: ['Tablet'], controlled: false, commonInteractions: ['Potassium supplements', 'NSAIDs', 'Spironolactone'] },
  { name: 'Atorvastatin (Lipitor)', generic: 'atorvastatin', strengths: ['10mg', '20mg', '40mg', '80mg'], forms: ['Tablet'], controlled: false, commonInteractions: ['Clarithromycin', 'Erythromycin', 'Grapefruit juice'] },
  { name: 'Metformin', generic: 'metformin HCl', strengths: ['500mg', '850mg', '1000mg'], forms: ['Tablet'], controlled: false, commonInteractions: ['Contrast dye', 'Alcohol', 'Cimetidine'] },
  { name: 'Amlodipine (Norvasc)', generic: 'amlodipine besylate', strengths: ['2.5mg', '5mg', '10mg'], forms: ['Tablet'], controlled: false, commonInteractions: ['Simvastatin', 'Cyclosporine', 'Clarithromycin'] },
  { name: 'Metoprolol Succinate (Toprol XL)', generic: 'metoprolol succinate', strengths: ['25mg', '50mg', '100mg', '200mg'], forms: ['Tablet'], controlled: false, commonInteractions: ['Verapamil', 'Diltiazem', 'Clonidine'] },
  { name: 'Omeprazole (Prilosec)', generic: 'omeprazole', strengths: ['10mg', '20mg', '40mg'], forms: ['Capsule'], controlled: false, commonInteractions: ['Clopidogrel', 'Methotrexate', 'Warfarin'] },
  { name: 'Levothyroxine (Synthroid)', generic: 'levothyroxine sodium', strengths: ['25mcg', '50mcg', '75mcg', '100mcg', '125mcg', '150mcg'], forms: ['Tablet'], controlled: false, commonInteractions: ['Calcium supplements', 'Iron supplements', 'Antacids'] },
  { name: 'Amoxicillin', generic: 'amoxicillin', strengths: ['250mg', '500mg', '875mg'], forms: ['Capsule', 'Liquid'], controlled: false, commonInteractions: ['Warfarin', 'Methotrexate', 'Oral contraceptives'] },
  { name: 'Hydrocodone/APAP (Vicodin)', generic: 'hydrocodone/acetaminophen', strengths: ['5/325mg', '7.5/325mg', '10/325mg'], forms: ['Tablet'], controlled: true, dea: 'Schedule II', commonInteractions: ['Benzodiazepines', 'Alcohol', 'MAOIs', 'Other opioids'] },
  { name: 'Alprazolam (Xanax)', generic: 'alprazolam', strengths: ['0.25mg', '0.5mg', '1mg', '2mg'], forms: ['Tablet'], controlled: true, dea: 'Schedule IV', commonInteractions: ['Opioids', 'Alcohol', 'Antihistamines', 'CNS depressants'] },
  { name: 'Warfarin (Coumadin)', generic: 'warfarin sodium', strengths: ['1mg', '2mg', '2.5mg', '5mg', '7.5mg', '10mg'], forms: ['Tablet'], controlled: false, commonInteractions: ['Aspirin', 'NSAIDs', 'Antibiotics', 'Vitamin K'] },
  { name: 'Furosemide (Lasix)', generic: 'furosemide', strengths: ['20mg', '40mg', '80mg'], forms: ['Tablet', 'Liquid', 'Injection'], controlled: false, commonInteractions: ['Digoxin', 'Lithium', 'NSAIDs', 'Aminoglycosides'] },
  { name: 'Gabapentin (Neurontin)', generic: 'gabapentin', strengths: ['100mg', '300mg', '400mg', '600mg', '800mg'], forms: ['Capsule', 'Tablet'], controlled: false, commonInteractions: ['Opioids', 'Antacids', 'Hydrocodone'] },
  { name: 'Sertraline (Zoloft)', generic: 'sertraline HCl', strengths: ['25mg', '50mg', '100mg'], forms: ['Tablet'], controlled: false, commonInteractions: ['MAOIs', 'Pimozide', 'NSAIDs', 'Warfarin'] },
];

const FREQUENCIES = ['Once daily (QD)', 'Twice daily (BID)', 'Three times daily (TID)', 'Four times daily (QID)', 'Every 4 hours', 'Every 6 hours', 'Every 8 hours', 'Every 12 hours', 'Weekly', 'As needed (PRN)'];
const ROUTES = ['Oral (PO)', 'Sublingual (SL)', 'Topical', 'Intravenous (IV)', 'Intramuscular (IM)', 'Subcutaneous (SC)', 'Inhalation', 'Ophthalmic', 'Otic', 'Rectal (PR)'];

const MOCK_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'rx001', patientId: 'p001', patientName: 'Robert Johnson',
    providerId: 'u1', providerName: 'Dr. Sarah Mitchell',
    prescribedDate: '2026-04-15', status: 'Active',
    drugName: 'Lisinopril', genericName: 'lisinopril',
    strength: '10mg', form: 'Tablet', dosage: '10mg once daily',
    frequency: 'Once daily (QD)', route: 'Oral (PO)',
    quantity: 30, refills: 5, daysSupply: 30,
    instructions: 'Take 1 tablet by mouth every morning with or without food. Monitor blood pressure regularly.',
    controlled: false,
    interactions: [],
  },
  {
    id: 'rx002', patientId: 'p001', patientName: 'Robert Johnson',
    providerId: 'u1', providerName: 'Dr. Sarah Mitchell',
    prescribedDate: '2026-04-15', status: 'Active',
    drugName: 'Atorvastatin (Lipitor)', genericName: 'atorvastatin',
    strength: '20mg', form: 'Tablet', dosage: '20mg once daily at bedtime',
    frequency: 'Once daily (QD)', route: 'Oral (PO)',
    quantity: 30, refills: 5, daysSupply: 30,
    instructions: 'Take 1 tablet by mouth at bedtime. Avoid grapefruit juice.',
    controlled: false,
    interactions: ['Lisinopril — Low risk combination. Monitor for hypotension.'],
  },
  {
    id: 'rx003', patientId: 'p003', patientName: 'David Thompson',
    providerId: 'u1', providerName: 'Dr. Sarah Mitchell',
    prescribedDate: '2026-04-20', status: 'Active',
    drugName: 'Metformin', genericName: 'metformin HCl',
    strength: '1000mg', form: 'Tablet', dosage: '1000mg twice daily',
    frequency: 'Twice daily (BID)', route: 'Oral (PO)',
    quantity: 60, refills: 3, daysSupply: 30,
    instructions: 'Take 1 tablet by mouth twice daily with meals to reduce GI side effects.',
    controlled: false,
    interactions: [],
  },
];

function checkInteractions(drug: Drug, existingRx: Prescription[]): string[] {
  const warnings: string[] = [];
  existingRx.forEach(rx => {
    const rxDrug = DRUG_DATABASE.find(d => d.name === rx.drugName);
    if (!rxDrug) return;
    // Check if selected drug's interactions mention existing drug
    drug.commonInteractions.forEach(interaction => {
      if (rx.drugName.toLowerCase().includes(interaction.toLowerCase()) ||
          rx.genericName.toLowerCase().includes(interaction.toLowerCase())) {
        const severity = drug.controlled || rxDrug.controlled ? 'HIGH' : 'MODERATE';
        warnings.push(`${drug.name} ↔ ${rx.drugName} [${severity}]: ${interaction} interaction detected`);
      }
    });
    // Check reverse
    rxDrug.commonInteractions.forEach(interaction => {
      if (drug.name.toLowerCase().includes(interaction.toLowerCase()) ||
          drug.generic.toLowerCase().includes(interaction.toLowerCase())) {
        const severity = drug.controlled || rxDrug.controlled ? 'HIGH' : 'MODERATE';
        const warn = `${rx.drugName} ↔ ${drug.name} [${severity}]: Potential interaction — monitor closely`;
        if (!warnings.includes(warn)) warnings.push(warn);
      }
    });
  });
  return warnings;
}

interface RxWriterProps {
  patientId?: string;
  existingRx: Prescription[];
  onSave: (rx: Prescription) => void;
  onClose: () => void;
}

function RxWriter({ patientId, existingRx, onSave, onClose }: RxWriterProps) {
  const [selectedPatient, setSelectedPatient] = useState(patientId || '');
  const [drugSearch, setDrugSearch] = useState('');
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [strength, setStrength] = useState('');
  const [form, setForm] = useState<Prescription['form']>('Tablet');
  const [frequency, setFrequency] = useState('Once daily (QD)');
  const [route, setRoute] = useState('Oral (PO)');
  const [quantity, setQuantity] = useState(30);
  const [refills, setRefills] = useState(0);
  const [daysSupply, setDaysSupply] = useState(30);
  const [instructions, setInstructions] = useState('');
  const [appointmentId, setAppointmentId] = useState('');
  const [interactions, setInteractions] = useState<string[]>([]);

  const filteredDrugs = DRUG_DATABASE.filter(d =>
    d.name.toLowerCase().includes(drugSearch.toLowerCase()) ||
    d.generic.toLowerCase().includes(drugSearch.toLowerCase())
  ).slice(0, 8);

  const selectDrug = (drug: Drug) => {
    setSelectedDrug(drug);
    setStrength(drug.strengths[0]);
    setForm(drug.forms[0] as Prescription['form']);
    setDrugSearch(drug.name);
    // Check interactions
    const patientRx = existingRx.filter(r => r.patientId === selectedPatient);
    const warns = checkInteractions(drug, patientRx);
    setInteractions(warns);
    if (warns.length > 0) {
      toast.warning(`${warns.length} drug interaction(s) detected`);
    }
  };

  const handleSave = () => {
    if (!selectedPatient || !selectedDrug || !strength) {
      toast.error('Please select patient and drug before saving');
      return;
    }
    const patient = MOCK_PATIENTS.find(p => p.id === selectedPatient);
    const rx: Prescription = {
      id: `rx${Date.now()}`,
      patientId: selectedPatient,
      patientName: patient ? `${patient.firstName} ${patient.lastName}` : '',
      providerId: 'u1',
      providerName: 'Dr. Sarah Mitchell',
      appointmentId: appointmentId || undefined,
      prescribedDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      drugName: selectedDrug.name,
      genericName: selectedDrug.generic,
      strength,
      form,
      dosage: `${strength} ${frequency.toLowerCase()}`,
      frequency,
      route,
      quantity,
      refills,
      daysSupply,
      instructions: instructions || `Take as directed by your physician.`,
      dea: selectedDrug.dea,
      controlled: selectedDrug.controlled,
      interactions,
    };
    onSave(rx);
    toast.success(`Prescription for ${selectedDrug.name} ${strength} created`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[hsl(var(--primary))] px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <Pill className="w-5 h-5 text-white" />
            <div>
              <h2 className="text-white font-bold text-lg">Write Prescription</h2>
              <p className="text-white/70 text-xs">Electronic prescription with interaction checking</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {/* Patient & Appointment */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text block mb-1">Patient *</label>
              <select className="select-field" value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)}>
                <option value="">Select patient...</option>
                {MOCK_PATIENTS.map(p => (
                  <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-text block mb-1">Link to Visit</label>
              <select className="select-field" value={appointmentId} onChange={e => setAppointmentId(e.target.value)}>
                <option value="">None</option>
                {MOCK_APPOINTMENTS.filter(a => !selectedPatient || a.patientId === selectedPatient).map(a => (
                  <option key={a.id} value={a.id}>{a.date} {a.time} — {a.type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Drug Search */}
          <div>
            <label className="label-text block mb-1">Drug Name *</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                className="input-field pl-9"
                placeholder="Search by brand or generic name..."
                value={drugSearch}
                onChange={e => { setDrugSearch(e.target.value); setSelectedDrug(null); setInteractions([]); }}
              />
              {drugSearch && !selectedDrug && filteredDrugs.length > 0 && (
                <div className="absolute top-full mt-1 left-0 right-0 bg-card border border-border rounded-lg shadow-xl z-30 overflow-hidden">
                  {filteredDrugs.map(d => (
                    <button
                      key={d.name}
                      onClick={() => selectDrug(d)}
                      className="w-full text-left px-4 py-2.5 hover:bg-muted transition-colors border-b border-border last:border-0 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium">{d.name}</p>
                        <p className="text-xs text-muted-foreground">{d.generic} • {d.forms.join(', ')}</p>
                      </div>
                      {d.controlled && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">{d.dea}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Interaction Warning */}
          {interactions.length > 0 && (
            <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0" />
                <p className="text-sm font-bold text-orange-700">Drug Interaction Alert — {interactions.length} interaction(s)</p>
              </div>
              <div className="space-y-1">
                {interactions.map((w, i) => (
                  <p key={i} className="text-xs text-orange-600 leading-relaxed">• {w}</p>
                ))}
              </div>
              <p className="text-xs text-orange-500 mt-2 font-medium">Review interactions before finalizing prescription.</p>
            </div>
          )}

          {selectedDrug && (
            <>
              {selectedDrug.controlled && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <p className="text-xs text-red-700 font-medium">Controlled Substance — {selectedDrug.dea}. DEA registration required. State prescription monitoring program (PMP) check recommended.</p>
                </div>
              )}

              {/* Strength & Form */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label-text block mb-1">Strength *</label>
                  <select className="select-field" value={strength} onChange={e => setStrength(e.target.value)}>
                    {selectedDrug.strengths.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-text block mb-1">Form</label>
                  <select className="select-field" value={form} onChange={e => setForm(e.target.value as Prescription['form'])}>
                    {selectedDrug.forms.map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-text block mb-1">Route</label>
                  <select className="select-field" value={route} onChange={e => setRoute(e.target.value)}>
                    {ROUTES.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              {/* Frequency & Supply */}
              <div>
                <label className="label-text block mb-1">Frequency *</label>
                <select className="select-field" value={frequency} onChange={e => setFrequency(e.target.value)}>
                  {FREQUENCIES.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label-text block mb-1">Quantity *</label>
                  <input type="number" min={1} className="input-field" value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 30)} />
                </div>
                <div>
                  <label className="label-text block mb-1">Refills</label>
                  <input type="number" min={0} max={selectedDrug.controlled ? 0 : 11} className="input-field" value={refills} onChange={e => setRefills(parseInt(e.target.value) || 0)} />
                  {selectedDrug.controlled && <p className="text-[10px] text-red-500 mt-0.5">No refills for controlled substances</p>}
                </div>
                <div>
                  <label className="label-text block mb-1">Days Supply</label>
                  <input type="number" min={1} className="input-field" value={daysSupply} onChange={e => setDaysSupply(parseInt(e.target.value) || 30)} />
                </div>
              </div>

              {/* Instructions */}
              <div>
                <label className="label-text block mb-1">Patient Instructions / Sig</label>
                <textarea
                  className="input-field resize-none"
                  rows={3}
                  placeholder="e.g., Take 1 tablet by mouth every morning with food."
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-5 py-3 flex justify-between items-center flex-shrink-0 bg-muted/20">
          <div className="text-xs text-muted-foreground">
            {interactions.length > 0 && (
              <span className="text-orange-600 font-medium flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3" /> {interactions.length} interaction(s) — review required
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button className="btn-outline" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={handleSave} disabled={!selectedDrug || !selectedPatient}>
              <Pill className="w-4 h-4" /> Write Prescription
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RxSlip({ rx, onClose }: { rx: Prescription; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-sm">Prescription Slip</h3>
          <div className="flex gap-2">
            <button className="text-xs btn-outline py-1 px-2.5" onClick={() => window.print()}>
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {/* Letterhead */}
          <div className="text-center border-b-2 border-[hsl(213,72%,22%)] pb-3">
            <p className="font-bold text-lg text-[hsl(213,72%,22%)]">MediFlow Health</p>
            <p className="text-xs text-gray-500">123 Medical Center Drive, Nashville, TN 37201</p>
            <p className="text-xs text-gray-500">DEA: FM1234567 • NPI: 1234567890</p>
          </div>
          {/* Rx Symbol */}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-500">Patient</p>
              <p className="font-bold">{rx.patientName}</p>
              <p className="text-xs text-gray-500 mt-1">Date: {formatDate(rx.prescribedDate)}</p>
            </div>
            <div className="text-right">
              <span className="text-4xl font-bold text-[hsl(213,72%,22%)] opacity-20">℞</span>
            </div>
          </div>
          {/* Drug */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            {rx.controlled && (
              <div className="flex items-center gap-1.5 mb-2">
                <Shield className="w-3.5 h-3.5 text-red-600" />
                <span className="text-xs font-bold text-red-600">CONTROLLED — {rx.dea}</span>
              </div>
            )}
            <p className="font-bold text-base">{rx.drugName} {rx.strength}</p>
            <p className="text-xs text-gray-500">{rx.genericName} {rx.form}</p>
            <p className="text-sm mt-2 font-medium">Sig: {rx.instructions}</p>
            <div className="grid grid-cols-3 gap-3 mt-3 text-xs">
              <div><p className="text-gray-400">Dispense</p><p className="font-semibold">#{rx.quantity}</p></div>
              <div><p className="text-gray-400">Refills</p><p className="font-semibold">{rx.refills} {rx.refills === 0 ? '(none)' : ''}</p></div>
              <div><p className="text-gray-400">Days Supply</p><p className="font-semibold">{rx.daysSupply} days</p></div>
            </div>
          </div>
          {/* Interactions */}
          {rx.interactions && rx.interactions.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded p-2.5">
              <p className="text-xs font-semibold text-orange-700 mb-1">⚠ Interaction Note (Provider Copy)</p>
              {rx.interactions.map((w, i) => <p key={i} className="text-[10px] text-orange-600">• {w}</p>)}
            </div>
          )}
          {/* Prescriber Signature */}
          <div className="border-t border-gray-200 pt-3 flex items-end justify-between">
            <div>
              <p className="text-xs text-gray-400">Prescriber</p>
              <p className="font-semibold text-sm">{rx.providerName}</p>
              <p className="text-xs text-gray-400">NPI: 1234567890</p>
            </div>
            <div className="text-right">
              <div className="h-8 border-b border-gray-400 w-32 mb-1"></div>
              <p className="text-xs text-gray-400">Signature</p>
            </div>
          </div>
          <p className="text-[10px] text-center text-gray-400 border-t pt-2">
            Substitution permitted unless "Dispense as Written" indicated. HIPAA protected document.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function EPrescription() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(MOCK_PRESCRIPTIONS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showWriter, setShowWriter] = useState(false);
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);
  const [expandedRx, setExpandedRx] = useState<string | null>(null);

  const filtered = prescriptions.filter(rx => {
    const matchSearch = `${rx.patientName} ${rx.drugName} ${rx.genericName}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || rx.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSave = (rx: Prescription) => {
    setPrescriptions(prev => [rx, ...prev]);
    setShowWriter(false);
  };

  const handleCancel = (id: string) => {
    setPrescriptions(prev => prev.map(rx => rx.id === id ? { ...rx, status: 'Cancelled' } : rx));
    toast.success('Prescription cancelled');
  };

  return (
    <div className="p-6 space-y-5">
      {showWriter && (
        <RxWriter
          existingRx={prescriptions}
          onSave={handleSave}
          onClose={() => setShowWriter(false)}
        />
      )}
      {selectedRx && <RxSlip rx={selectedRx} onClose={() => setSelectedRx(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">E-Prescriptions</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Electronic prescriptions with drug interaction checking</p>
        </div>
        <button className="btn-primary" onClick={() => setShowWriter(true)}>
          <Plus className="w-4 h-4" /> Write Prescription
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Prescriptions', value: prescriptions.filter(r => r.status === 'Active').length, color: 'text-emerald-600' },
          { label: 'Controlled Substances', value: prescriptions.filter(r => r.controlled).length, color: 'text-red-600' },
          { label: 'Interaction Alerts', value: prescriptions.filter(r => r.interactions && r.interactions.length > 0).length, color: 'text-orange-600' },
          { label: 'Total Prescriptions', value: prescriptions.length, color: 'text-[hsl(var(--primary))]' },
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
          <input className="input-field pl-9" placeholder="Search prescriptions..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {['All', 'Active', 'Cancelled', 'Completed', 'On Hold'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={cn('px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              statusFilter === s ? 'bg-[hsl(var(--primary))] text-white' : 'bg-secondary text-secondary-foreground hover:bg-secondary/70'
            )}>
            {s}
          </button>
        ))}
      </div>

      {/* Prescription List */}
      <div className="space-y-3">
        {filtered.map(rx => {
          const isExpanded = expandedRx === rx.id;
          return (
            <div key={rx.id} className={cn('bg-card border rounded-lg overflow-hidden', rx.controlled ? 'border-red-200' : rx.interactions && rx.interactions.length > 0 ? 'border-orange-200' : 'border-border')}>
              <div className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-muted/20" onClick={() => setExpandedRx(isExpanded ? null : rx.id)}>
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', rx.controlled ? 'bg-red-50' : 'bg-[hsl(var(--teal))]/10')}>
                  <Pill className={cn('w-4 h-4', rx.controlled ? 'text-red-600' : 'text-[hsl(var(--teal))]')} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm">{rx.drugName} {rx.strength}</p>
                    {rx.controlled && <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">{rx.dea}</span>}
                    {rx.interactions && rx.interactions.length > 0 && (
                      <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5" /> {rx.interactions.length} interaction
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><User className="w-3 h-3" />{rx.patientName}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(rx.prescribedDate)}</span>
                    <span className="text-xs text-muted-foreground">{rx.frequency} • Qty: {rx.quantity} • {rx.refills} refill(s)</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={cn('badge-status',
                    rx.status === 'Active' ? 'text-emerald-700 bg-emerald-50' :
                    rx.status === 'Cancelled' ? 'text-red-700 bg-red-50' :
                    rx.status === 'On Hold' ? 'text-yellow-700 bg-yellow-50' : 'text-gray-700 bg-gray-50'
                  )}>{rx.status}</span>
                  {rx.status === 'Active' && (
                    <>
                      <button onClick={e => { e.stopPropagation(); setSelectedRx(rx); }} className="btn-outline py-1 px-2.5 text-xs">
                        <Printer className="w-3.5 h-3.5" /> Print
                      </button>
                      <button onClick={e => { e.stopPropagation(); handleCancel(rx.id); }} className="text-xs text-red-600 hover:underline">Cancel</button>
                    </>
                  )}
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </div>
              {isExpanded && (
                <div className="border-t border-border p-4 bg-muted/10 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div><p className="label-text">Generic</p><p className="font-medium mt-0.5 text-xs">{rx.genericName}</p></div>
                  <div><p className="label-text">Form / Route</p><p className="font-medium mt-0.5 text-xs">{rx.form} — {rx.route}</p></div>
                  <div><p className="label-text">Days Supply</p><p className="font-medium mt-0.5 text-xs">{rx.daysSupply} days</p></div>
                  <div><p className="label-text">Provider</p><p className="font-medium mt-0.5 text-xs">{rx.providerName}</p></div>
                  <div className="md:col-span-4"><p className="label-text">Sig / Instructions</p><p className="font-medium mt-0.5 text-xs leading-relaxed">{rx.instructions}</p></div>
                  {rx.interactions && rx.interactions.length > 0 && (
                    <div className="md:col-span-4 bg-orange-50 rounded-md p-3 border border-orange-200">
                      <p className="text-xs font-bold text-orange-700 mb-1 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" />Drug Interactions</p>
                      {rx.interactions.map((w, i) => <p key={i} className="text-xs text-orange-600">• {w}</p>)}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Pill className="w-12 h-12 mx-auto mb-3 text-border" />
            <p className="text-sm">No prescriptions found.</p>
            <button className="btn-primary mt-4 mx-auto" onClick={() => setShowWriter(true)}>
              <Plus className="w-4 h-4" /> Write First Prescription
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
