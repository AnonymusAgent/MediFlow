export type UserRole = 'admin' | 'biller' | 'coder' | 'provider';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  npi?: string;
  specialty?: string;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  ssn?: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  primaryInsurance: Insurance;
  secondaryInsurance?: Insurance;
  mrn: string;
  status: 'Active' | 'Inactive' | 'Pending';
  createdAt: string;
  provider: string;
}

export interface Insurance {
  id: string;
  payerName: string;
  payerId: string;
  memberId: string;
  groupNumber?: string;
  planName: string;
  eligibilityStatus: 'Verified' | 'Pending' | 'Failed' | 'Unknown';
  effectiveDate: string;
  terminationDate?: string;
  copay?: number;
  deductible?: number;
  deductibleMet?: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  providerId: string;
  providerName: string;
  date: string;
  time: string;
  duration: number;
  type: 'New Patient' | 'Follow-up' | 'Consultation' | 'Procedure' | 'Telehealth';
  status: 'Scheduled' | 'Confirmed' | 'Checked In' | 'In Progress' | 'Completed' | 'Cancelled' | 'No Show';
  reason: string;
  notes?: string;
  room?: string;
}

export interface Claim {
  id: string;
  claimNumber: string;
  patientId: string;
  patientName: string;
  providerId: string;
  providerName: string;
  dateOfService: string;
  submittedDate?: string;
  payerName: string;
  payerId: string;
  totalCharges: number;
  allowedAmount?: number;
  paidAmount?: number;
  adjustments?: number;
  patientResponsibility?: number;
  balance: number;
  status: ClaimStatus;
  diagnosisCodes: DiagnosisCode[];
  procedureCodes: ProcedureCode[];
  denialReason?: string;
  denialCode?: string;
  scrubErrors?: string[];
}

export type ClaimStatus =
  | 'Draft'
  | 'Ready to Submit'
  | 'Submitted'
  | 'Accepted'
  | 'Pending'
  | 'Paid'
  | 'Partially Paid'
  | 'Denied'
  | 'Appealed'
  | 'Void';

export interface DiagnosisCode {
  code: string;
  description: string;
  type: 'Primary' | 'Secondary' | 'Tertiary';
}

export interface ProcedureCode {
  code: string;
  description: string;
  modifier?: string;
  units: number;
  chargeAmount: number;
  allowedAmount?: number;
}

export interface Payment {
  id: string;
  claimId: string;
  claimNumber: string;
  patientName: string;
  paymentDate: string;
  paymentType: 'Insurance' | 'Patient' | 'Copay' | 'Deductible';
  paymentMethod: 'Check' | 'EFT' | 'Credit Card' | 'Cash' | 'Money Order';
  amount: number;
  checkNumber?: string;
  eraNumber?: string;
  notes?: string;
}

export interface ARItem {
  patientId: string;
  patientName: string;
  claimId: string;
  claimNumber: string;
  dateOfService: string;
  payerName: string;
  totalCharges: number;
  balance: number;
  agingBucket: '0-30' | '31-60' | '61-90' | '91-120' | '120+';
  status: ClaimStatus;
  lastAction?: string;
  lastActionDate?: string;
}

export interface DashboardStats {
  totalPatients: number;
  activePatients: number;
  newPatientsThisMonth: number;
  appointmentsToday: number;
  appointmentsThisWeek: number;
  claimsSubmittedThisMonth: number;
  claimsPending: number;
  claimsDenied: number;
  totalChargesThisMonth: number;
  totalCollectionsThisMonth: number;
  collectionRate: number;
  totalAR: number;
  ar30: number;
  ar60: number;
  ar90: number;
  ar120plus: number;
  denialRate: number;
  cleanClaimRate: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  module: string;
  details: string;
  timestamp: string;
  ipAddress: string;
}

export type NavModule =
  | 'dashboard'
  | 'patients'
  | 'scheduling'
  | 'billing'
  | 'claims'
  | 'payments'
  | 'ar'
  | 'era'
  | 'coding'
  | 'notes'
  | 'statement'
  | 'reports'
  | 'users'
  | 'audit';
