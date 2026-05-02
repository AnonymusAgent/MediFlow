import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Dashboard from '@/components/features/Dashboard';
import Patients from '@/components/features/Patients';
import Scheduling from '@/components/features/Scheduling';
import ChargeEntry from '@/components/features/ChargeEntry';
import Claims from '@/components/features/Claims';
import Payments from '@/components/features/Payments';
import ARManagement from '@/components/features/ARManagement';
import Coding from '@/components/features/Coding';
import Reports from '@/components/features/Reports';
import UsersAndAudit from '@/components/features/UsersAndAudit';
import ClinicalNotes from '@/components/features/ClinicalNotes';
import ERAPosting from '@/components/features/ERAPosting';
import PatientStatement from '@/components/features/PatientStatement';
import EPrescription from '@/components/features/EPrescription';
import PriorAuth from '@/components/features/PriorAuth';
import { useAppStore } from '@/stores/appStore';
import { NavModule } from '@/types';
import { Navigate } from 'react-router-dom';

const MODULE_MAP: Record<NavModule, React.ReactNode> = {
  dashboard: <Dashboard />,
  patients: <Patients />,
  scheduling: <Scheduling />,
  billing: <ChargeEntry />,
  claims: <Claims />,
  payments: <Payments />,
  ar: <ARManagement />,
  era: <ERAPosting />,
  coding: <Coding />,
  notes: <ClinicalNotes />,
  rx: <EPrescription />,
  priorauth: <PriorAuth />,
  statement: <PatientStatement />,
  reports: <Reports />,
  users: <UsersAndAudit />,
  audit: <UsersAndAudit />,
};

export default function Index() {
  const { activeModule, isAuthenticated } = useAppStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {MODULE_MAP[activeModule] ?? <Dashboard />}
        </main>
      </div>
    </div>
  );
}
