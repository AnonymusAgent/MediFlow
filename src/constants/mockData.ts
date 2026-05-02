import { Patient, Appointment, Claim, Payment, ARItem, DashboardStats, AuditLog, User } from '@/types';

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Dr. Sarah Mitchell', email: 'sarah.mitchell@mediflow.com', role: 'provider', npi: '1234567890', specialty: 'Internal Medicine' },
  { id: 'u2', name: 'James Rivera', email: 'james.rivera@mediflow.com', role: 'biller' },
  { id: 'u3', name: 'Emily Chen', email: 'emily.chen@mediflow.com', role: 'coder' },
  { id: 'u4', name: 'Admin User', email: 'admin@mediflow.com', role: 'admin' },
  { id: 'u5', name: 'Dr. Michael Torres', email: 'michael.torres@mediflow.com', role: 'provider', npi: '0987654321', specialty: 'Cardiology' },
];

export const MOCK_PATIENTS: Patient[] = [
  {
    id: 'p001', firstName: 'Robert', lastName: 'Johnson', dob: '1968-03-15', gender: 'Male',
    phone: '(555) 234-5678', email: 'robert.johnson@email.com',
    address: '123 Oak Street', city: 'Nashville', state: 'TN', zip: '37201',
    mrn: 'MRN-001234', status: 'Active', createdAt: '2023-01-10', provider: 'Dr. Sarah Mitchell',
    primaryInsurance: { id: 'i1', payerName: 'Blue Cross Blue Shield', payerId: 'BCBS01', memberId: 'BCB123456789', groupNumber: 'GRP001', planName: 'PPO 2000', eligibilityStatus: 'Verified', effectiveDate: '2024-01-01', copay: 30, deductible: 2000, deductibleMet: 850 },
  },
  {
    id: 'p002', firstName: 'Maria', lastName: 'Garcia', dob: '1975-07-22', gender: 'Female',
    phone: '(555) 345-6789', email: 'maria.garcia@email.com',
    address: '456 Maple Ave', city: 'Nashville', state: 'TN', zip: '37203',
    mrn: 'MRN-001235', status: 'Active', createdAt: '2023-03-05', provider: 'Dr. Michael Torres',
    primaryInsurance: { id: 'i2', payerName: 'Aetna', payerId: 'AETN01', memberId: 'AET987654321', groupNumber: 'GRP002', planName: 'HMO 1500', eligibilityStatus: 'Verified', effectiveDate: '2024-01-01', copay: 20, deductible: 1500, deductibleMet: 1500 },
    secondaryInsurance: { id: 'i3', payerName: 'Medicare', payerId: 'MCARE', memberId: 'MCR111222333', planName: 'Part B', eligibilityStatus: 'Verified', effectiveDate: '2020-07-01' },
  },
  {
    id: 'p003', firstName: 'David', lastName: 'Thompson', dob: '1955-11-08', gender: 'Male',
    phone: '(555) 456-7890',
    address: '789 Pine Road', city: 'Brentwood', state: 'TN', zip: '37027',
    mrn: 'MRN-001236', status: 'Active', createdAt: '2022-11-20', provider: 'Dr. Sarah Mitchell',
    primaryInsurance: { id: 'i4', payerName: 'Medicare', payerId: 'MCARE', memberId: 'MCR444555666', planName: 'Part B', eligibilityStatus: 'Verified', effectiveDate: '2020-11-01', copay: 0, deductible: 240, deductibleMet: 240 },
  },
  {
    id: 'p004', firstName: 'Jennifer', lastName: 'Williams', dob: '1990-02-14', gender: 'Female',
    phone: '(555) 567-8901', email: 'jennifer.w@email.com',
    address: '321 Elm Street', city: 'Franklin', state: 'TN', zip: '37064',
    mrn: 'MRN-001237', status: 'Active', createdAt: '2024-01-15', provider: 'Dr. Michael Torres',
    primaryInsurance: { id: 'i5', payerName: 'United Healthcare', payerId: 'UHHC01', memberId: 'UHC789012345', groupNumber: 'GRP003', planName: 'Choice Plus', eligibilityStatus: 'Verified', effectiveDate: '2024-01-01', copay: 25, deductible: 3000, deductibleMet: 125 },
  },
  {
    id: 'p005', firstName: 'Charles', lastName: 'Brown', dob: '1948-09-30', gender: 'Male',
    phone: '(555) 678-9012',
    address: '654 Birch Lane', city: 'Murfreesboro', state: 'TN', zip: '37128',
    mrn: 'MRN-001238', status: 'Active', createdAt: '2021-06-08', provider: 'Dr. Sarah Mitchell',
    primaryInsurance: { id: 'i6', payerName: 'Medicare', payerId: 'MCARE', memberId: 'MCR777888999', planName: 'Part B', eligibilityStatus: 'Pending', effectiveDate: '2013-09-01', copay: 0, deductible: 240, deductibleMet: 180 },
  },
  {
    id: 'p006', firstName: 'Linda', lastName: 'Martinez', dob: '1982-05-18', gender: 'Female',
    phone: '(555) 789-0123', email: 'linda.m@email.com',
    address: '987 Cedar Court', city: 'Nashville', state: 'TN', zip: '37211',
    mrn: 'MRN-001239', status: 'Active', createdAt: '2024-02-28', provider: 'Dr. Michael Torres',
    primaryInsurance: { id: 'i7', payerName: 'Cigna', payerId: 'CGNA01', memberId: 'CGN012345678', groupNumber: 'GRP004', planName: 'Open Access Plus', eligibilityStatus: 'Verified', effectiveDate: '2024-01-01', copay: 35, deductible: 1500, deductibleMet: 0 },
  },
  {
    id: 'p007', firstName: 'Thomas', lastName: 'Anderson', dob: '1963-12-25', gender: 'Male',
    phone: '(555) 890-1234',
    address: '147 Walnut Blvd', city: 'Hendersonville', state: 'TN', zip: '37075',
    mrn: 'MRN-001240', status: 'Inactive', createdAt: '2020-04-12', provider: 'Dr. Sarah Mitchell',
    primaryInsurance: { id: 'i8', payerName: 'Humana', payerId: 'HUMN01', memberId: 'HUM345678901', groupNumber: 'GRP005', planName: 'Gold Plus', eligibilityStatus: 'Failed', effectiveDate: '2023-01-01', terminationDate: '2023-12-31' },
  },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  { id: 'a001', patientId: 'p001', patientName: 'Robert Johnson', providerId: 'u1', providerName: 'Dr. Sarah Mitchell', date: '2026-04-28', time: '09:00', duration: 30, type: 'Follow-up', status: 'Confirmed', reason: 'Hypertension management', room: 'Room 3' },
  { id: 'a002', patientId: 'p002', patientName: 'Maria Garcia', providerId: 'u5', providerName: 'Dr. Michael Torres', date: '2026-04-28', time: '09:30', duration: 45, type: 'Consultation', status: 'Checked In', reason: 'Chest pain evaluation', room: 'Room 1' },
  { id: 'a003', patientId: 'p004', patientName: 'Jennifer Williams', providerId: 'u5', providerName: 'Dr. Michael Torres', date: '2026-04-28', time: '10:00', duration: 60, type: 'New Patient', status: 'Scheduled', reason: 'Annual cardiac checkup', room: 'Room 2' },
  { id: 'a004', patientId: 'p003', patientName: 'David Thompson', providerId: 'u1', providerName: 'Dr. Sarah Mitchell', date: '2026-04-28', time: '10:30', duration: 30, type: 'Follow-up', status: 'In Progress', reason: 'Diabetes management', room: 'Room 3' },
  { id: 'a005', patientId: 'p006', patientName: 'Linda Martinez', providerId: 'u5', providerName: 'Dr. Michael Torres', date: '2026-04-28', time: '11:00', duration: 30, type: 'Follow-up', status: 'Scheduled', reason: 'Medication review', room: 'Room 1' },
  { id: 'a006', patientId: 'p005', patientName: 'Charles Brown', providerId: 'u1', providerName: 'Dr. Sarah Mitchell', date: '2026-04-28', time: '11:30', duration: 45, type: 'Procedure', status: 'Scheduled', reason: 'EKG monitoring', room: 'Room 4' },
  { id: 'a007', patientId: 'p001', patientName: 'Robert Johnson', providerId: 'u1', providerName: 'Dr. Sarah Mitchell', date: '2026-04-29', time: '14:00', duration: 30, type: 'Follow-up', status: 'Scheduled', reason: 'Lab results review' },
  { id: 'a008', patientId: 'p007', patientName: 'Thomas Anderson', providerId: 'u1', providerName: 'Dr. Sarah Mitchell', date: '2026-04-29', time: '15:00', duration: 30, type: 'Telehealth', status: 'Cancelled', reason: 'General checkup' },
];

export const MOCK_CLAIMS: Claim[] = [
  {
    id: 'c001', claimNumber: 'CLM-2026-001234', patientId: 'p001', patientName: 'Robert Johnson',
    providerId: 'u1', providerName: 'Dr. Sarah Mitchell', dateOfService: '2026-04-15',
    submittedDate: '2026-04-16', payerName: 'Blue Cross Blue Shield', payerId: 'BCBS01',
    totalCharges: 285.00, allowedAmount: 198.50, paidAmount: 168.50, adjustments: 86.50,
    patientResponsibility: 30.00, balance: 0,
    status: 'Paid',
    diagnosisCodes: [{ code: 'I10', description: 'Essential Hypertension', type: 'Primary' }],
    procedureCodes: [{ code: '99213', description: 'Office/outpatient visit, established patient, moderate complexity', units: 1, chargeAmount: 285.00, allowedAmount: 198.50 }],
  },
  {
    id: 'c002', claimNumber: 'CLM-2026-001235', patientId: 'p002', patientName: 'Maria Garcia',
    providerId: 'u5', providerName: 'Dr. Michael Torres', dateOfService: '2026-04-18',
    submittedDate: '2026-04-19', payerName: 'Aetna', payerId: 'AETN01',
    totalCharges: 850.00, balance: 850.00,
    status: 'Denied',
    denialReason: 'Service not covered - Prior authorization required',
    denialCode: 'CO-4',
    diagnosisCodes: [
      { code: 'R07.9', description: 'Chest pain, unspecified', type: 'Primary' },
      { code: 'I25.10', description: 'Atherosclerotic heart disease', type: 'Secondary' },
    ],
    procedureCodes: [
      { code: '93000', description: 'Electrocardiogram, routine, with interpretation and report', units: 1, chargeAmount: 150.00 },
      { code: '93306', description: 'Echocardiography, transthoracic', units: 1, chargeAmount: 700.00 },
    ],
  },
  {
    id: 'c003', claimNumber: 'CLM-2026-001236', patientId: 'p003', patientName: 'David Thompson',
    providerId: 'u1', providerName: 'Dr. Sarah Mitchell', dateOfService: '2026-04-20',
    submittedDate: '2026-04-21', payerName: 'Medicare', payerId: 'MCARE',
    totalCharges: 340.00, balance: 340.00,
    status: 'Pending',
    diagnosisCodes: [{ code: 'E11.9', description: 'Type 2 diabetes mellitus without complications', type: 'Primary' }],
    procedureCodes: [{ code: '99214', description: 'Office/outpatient visit, established patient, moderate-high complexity', units: 1, chargeAmount: 340.00 }],
  },
  {
    id: 'c004', claimNumber: 'CLM-2026-001237', patientId: 'p004', patientName: 'Jennifer Williams',
    providerId: 'u5', providerName: 'Dr. Michael Torres', dateOfService: '2026-04-22',
    payerName: 'United Healthcare', payerId: 'UHHC01',
    totalCharges: 520.00, balance: 520.00,
    status: 'Ready to Submit',
    diagnosisCodes: [{ code: 'Z00.00', description: 'Encounter for general adult medical examination', type: 'Primary' }],
    procedureCodes: [
      { code: '99385', description: 'Initial preventive medicine evaluation, 18-39 years', units: 1, chargeAmount: 420.00 },
      { code: '36415', description: 'Venipuncture, routine', units: 1, chargeAmount: 100.00 },
    ],
  },
  {
    id: 'c005', claimNumber: 'CLM-2026-001238', patientId: 'p001', patientName: 'Robert Johnson',
    providerId: 'u1', providerName: 'Dr. Sarah Mitchell', dateOfService: '2026-04-10',
    submittedDate: '2026-04-11', payerName: 'Blue Cross Blue Shield', payerId: 'BCBS01',
    totalCharges: 145.00, allowedAmount: 101.50, paidAmount: 71.50, adjustments: 43.50,
    patientResponsibility: 30.00, balance: 30.00,
    status: 'Partially Paid',
    diagnosisCodes: [{ code: 'I10', description: 'Essential Hypertension', type: 'Primary' }],
    procedureCodes: [{ code: '99212', description: 'Office/outpatient visit, established patient, low complexity', units: 1, chargeAmount: 145.00, allowedAmount: 101.50 }],
  },
  {
    id: 'c006', claimNumber: 'CLM-2026-001239', patientId: 'p006', patientName: 'Linda Martinez',
    providerId: 'u5', providerName: 'Dr. Michael Torres', dateOfService: '2026-04-25',
    payerName: 'Cigna', payerId: 'CGNA01',
    totalCharges: 275.00, balance: 275.00,
    status: 'Draft',
    scrubErrors: ['Missing modifier for code 99213', 'Secondary diagnosis code required'],
    diagnosisCodes: [{ code: 'J06.9', description: 'Acute upper respiratory infection, unspecified', type: 'Primary' }],
    procedureCodes: [{ code: '99213', description: 'Office/outpatient visit, established patient, moderate complexity', units: 1, chargeAmount: 275.00 }],
  },
  {
    id: 'c007', claimNumber: 'CLM-2026-001240', patientId: 'p005', patientName: 'Charles Brown',
    providerId: 'u1', providerName: 'Dr. Sarah Mitchell', dateOfService: '2026-03-30',
    submittedDate: '2026-03-31', payerName: 'Medicare', payerId: 'MCARE',
    totalCharges: 890.00, balance: 890.00,
    status: 'Appealed',
    denialReason: 'Duplicate claim',
    denialCode: 'CO-97',
    diagnosisCodes: [{ code: 'I48.91', description: 'Unspecified atrial fibrillation', type: 'Primary' }],
    procedureCodes: [{ code: '93306', description: 'Echocardiography, transthoracic', units: 1, chargeAmount: 890.00 }],
  },
];

export const MOCK_PAYMENTS: Payment[] = [
  { id: 'pay001', claimId: 'c001', claimNumber: 'CLM-2026-001234', patientName: 'Robert Johnson', paymentDate: '2026-04-22', paymentType: 'Insurance', paymentMethod: 'EFT', amount: 168.50, eraNumber: 'ERA-20260422-001' },
  { id: 'pay002', claimId: 'c001', claimNumber: 'CLM-2026-001234', patientName: 'Robert Johnson', paymentDate: '2026-04-24', paymentType: 'Copay', paymentMethod: 'Credit Card', amount: 30.00 },
  { id: 'pay003', claimId: 'c005', claimNumber: 'CLM-2026-001238', patientName: 'Robert Johnson', paymentDate: '2026-04-20', paymentType: 'Insurance', paymentMethod: 'EFT', amount: 71.50, eraNumber: 'ERA-20260420-002' },
  { id: 'pay004', claimId: 'c003', claimNumber: 'CLM-2026-001236', patientName: 'David Thompson', paymentDate: '2026-04-26', paymentType: 'Patient', paymentMethod: 'Check', amount: 48.00, checkNumber: 'CHK-4521' },
];

export const MOCK_AR: ARItem[] = [
  { patientId: 'p002', patientName: 'Maria Garcia', claimId: 'c002', claimNumber: 'CLM-2026-001235', dateOfService: '2026-04-18', payerName: 'Aetna', totalCharges: 850.00, balance: 850.00, agingBucket: '0-30', status: 'Denied', lastAction: 'Appeal submitted', lastActionDate: '2026-04-25' },
  { patientId: 'p003', patientName: 'David Thompson', claimId: 'c003', claimNumber: 'CLM-2026-001236', dateOfService: '2026-04-20', payerName: 'Medicare', totalCharges: 340.00, balance: 340.00, agingBucket: '0-30', status: 'Pending', lastAction: 'Claim submitted', lastActionDate: '2026-04-21' },
  { patientId: 'p001', patientName: 'Robert Johnson', claimId: 'c005', claimNumber: 'CLM-2026-001238', dateOfService: '2026-04-10', payerName: 'Blue Cross Blue Shield', totalCharges: 145.00, balance: 30.00, agingBucket: '0-30', status: 'Partially Paid', lastAction: 'Patient statement sent', lastActionDate: '2026-04-23' },
  { patientId: 'p005', patientName: 'Charles Brown', claimId: 'c007', claimNumber: 'CLM-2026-001240', dateOfService: '2026-03-30', payerName: 'Medicare', totalCharges: 890.00, balance: 890.00, agingBucket: '31-60', status: 'Appealed', lastAction: 'Appeal letter sent', lastActionDate: '2026-04-10' },
];

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  totalPatients: 1248,
  activePatients: 1089,
  newPatientsThisMonth: 34,
  appointmentsToday: 18,
  appointmentsThisWeek: 87,
  claimsSubmittedThisMonth: 312,
  claimsPending: 48,
  claimsDenied: 23,
  totalChargesThisMonth: 187420.00,
  totalCollectionsThisMonth: 142380.00,
  collectionRate: 75.9,
  totalAR: 89240.00,
  ar30: 34120.00,
  ar60: 28450.00,
  ar90: 15670.00,
  ar120plus: 11000.00,
  denialRate: 7.4,
  cleanClaimRate: 94.2,
};

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 'log001', userId: 'u2', userName: 'James Rivera', userRole: 'biller', action: 'Claim Submitted', module: 'Billing', details: 'Submitted claim CLM-2026-001237 to United Healthcare', timestamp: '2026-04-28T09:15:22Z', ipAddress: '192.168.1.105' },
  { id: 'log002', userId: 'u3', userName: 'Emily Chen', userRole: 'coder', action: 'Code Updated', module: 'Coding', details: 'Updated ICD-10 code on claim CLM-2026-001236', timestamp: '2026-04-28T08:45:10Z', ipAddress: '192.168.1.107' },
  { id: 'log003', userId: 'u1', userName: 'Dr. Sarah Mitchell', userRole: 'provider', action: 'Patient Viewed', module: 'Patients', details: 'Viewed patient record MRN-001234 (Robert Johnson)', timestamp: '2026-04-28T08:30:00Z', ipAddress: '192.168.1.102' },
  { id: 'log004', userId: 'u4', userName: 'Admin User', userRole: 'admin', action: 'User Created', module: 'Users', details: 'Created new biller account for Lisa Park', timestamp: '2026-04-27T17:20:45Z', ipAddress: '192.168.1.100' },
  { id: 'log005', userId: 'u2', userName: 'James Rivera', userRole: 'biller', action: 'Payment Posted', module: 'Payments', details: 'Posted ERA payment ERA-20260422-001 for $168.50', timestamp: '2026-04-27T14:10:30Z', ipAddress: '192.168.1.105' },
];

export const CPT_CODES = [
  { code: '99201', description: 'Office/outpatient visit, new patient, minimal complexity', fee: 75.00 },
  { code: '99202', description: 'Office/outpatient visit, new patient, straightforward', fee: 112.00 },
  { code: '99203', description: 'Office/outpatient visit, new patient, low complexity', fee: 162.00 },
  { code: '99204', description: 'Office/outpatient visit, new patient, moderate complexity', fee: 228.00 },
  { code: '99205', description: 'Office/outpatient visit, new patient, high complexity', fee: 302.00 },
  { code: '99211', description: 'Office/outpatient visit, established patient, minimal', fee: 45.00 },
  { code: '99212', description: 'Office/outpatient visit, established patient, straightforward', fee: 93.00 },
  { code: '99213', description: 'Office/outpatient visit, established patient, low complexity', fee: 145.00 },
  { code: '99214', description: 'Office/outpatient visit, established patient, moderate complexity', fee: 198.00 },
  { code: '99215', description: 'Office/outpatient visit, established patient, high complexity', fee: 271.00 },
  { code: '99385', description: 'Preventive medicine, new patient, 18-39 years', fee: 248.00 },
  { code: '99386', description: 'Preventive medicine, new patient, 40-64 years', fee: 298.00 },
  { code: '93000', description: 'Electrocardiogram, routine ECG', fee: 89.00 },
  { code: '93306', description: 'Echocardiography, transthoracic', fee: 580.00 },
  { code: '36415', description: 'Venipuncture, routine', fee: 45.00 },
  { code: '85025', description: 'Complete blood count with differential', fee: 62.00 },
  { code: '80053', description: 'Comprehensive metabolic panel', fee: 78.00 },
  { code: '71046', description: 'Radiology exam of chest, 2 views', fee: 142.00 },
];

export const ICD10_CODES = [
  { code: 'I10', description: 'Essential (primary) hypertension' },
  { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications' },
  { code: 'E11.65', description: 'Type 2 diabetes mellitus with hyperglycemia' },
  { code: 'J06.9', description: 'Acute upper respiratory infection, unspecified' },
  { code: 'R07.9', description: 'Chest pain, unspecified' },
  { code: 'I25.10', description: 'Atherosclerotic heart disease of native coronary artery' },
  { code: 'I48.91', description: 'Unspecified atrial fibrillation' },
  { code: 'Z00.00', description: 'Encounter for general adult medical examination without abnormal findings' },
  { code: 'M54.5', description: 'Low back pain' },
  { code: 'F32.9', description: 'Major depressive disorder, single episode, unspecified' },
  { code: 'J18.9', description: 'Pneumonia, unspecified organism' },
  { code: 'K21.0', description: 'Gastro-esophageal reflux disease with esophagitis' },
  { code: 'N39.0', description: 'Urinary tract infection, site not specified' },
  { code: 'Z79.01', description: 'Long-term (current) use of anticoagulants' },
];
