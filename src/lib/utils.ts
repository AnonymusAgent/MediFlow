import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'));
  return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
}

export function formatDateTime(dateStr: string): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function getAgingColor(bucket: string): string {
  switch (bucket) {
    case '0-30': return 'text-emerald-600 bg-emerald-50';
    case '31-60': return 'text-yellow-600 bg-yellow-50';
    case '61-90': return 'text-orange-600 bg-orange-50';
    case '91-120': return 'text-red-600 bg-red-50';
    case '120+': return 'text-red-800 bg-red-100';
    default: return 'text-muted-foreground bg-muted';
  }
}

export function getClaimStatusColor(status: string): string {
  switch (status) {
    case 'Paid': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    case 'Partially Paid': return 'text-teal-700 bg-teal-50 border-teal-200';
    case 'Pending': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    case 'Submitted': return 'text-blue-700 bg-blue-50 border-blue-200';
    case 'Accepted': return 'text-indigo-700 bg-indigo-50 border-indigo-200';
    case 'Denied': return 'text-red-700 bg-red-50 border-red-200';
    case 'Appealed': return 'text-orange-700 bg-orange-50 border-orange-200';
    case 'Ready to Submit': return 'text-purple-700 bg-purple-50 border-purple-200';
    case 'Draft': return 'text-gray-700 bg-gray-50 border-gray-200';
    case 'Void': return 'text-gray-500 bg-gray-50 border-gray-200';
    default: return 'text-muted-foreground bg-muted border-border';
  }
}

export function getAppointmentStatusColor(status: string): string {
  switch (status) {
    case 'Confirmed': return 'text-blue-700 bg-blue-50';
    case 'Checked In': return 'text-teal-700 bg-teal-50';
    case 'In Progress': return 'text-purple-700 bg-purple-50';
    case 'Completed': return 'text-emerald-700 bg-emerald-50';
    case 'Cancelled': return 'text-red-700 bg-red-50';
    case 'No Show': return 'text-orange-700 bg-orange-50';
    case 'Scheduled': return 'text-yellow-700 bg-yellow-50';
    default: return 'text-muted-foreground bg-muted';
  }
}

export function getEligibilityColor(status: string): string {
  switch (status) {
    case 'Verified': return 'text-emerald-700 bg-emerald-50';
    case 'Pending': return 'text-yellow-700 bg-yellow-50';
    case 'Failed': return 'text-red-700 bg-red-50';
    default: return 'text-muted-foreground bg-muted';
  }
}

export function calculateAge(dob: string): number {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
}
