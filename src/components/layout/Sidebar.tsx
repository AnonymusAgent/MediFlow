import { NavModule, UserRole } from '@/types';
import {
  LayoutDashboard, Users, Calendar, FileText, CreditCard,
  DollarSign, TrendingUp, Code, BarChart3, Shield, ClipboardList,
  ChevronLeft, ChevronRight, Activity, Stethoscope, Receipt, Zap,
  Pill, LogOut, ShieldCheck, Brain
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface NavItem {
  id: NavModule;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
  badge?: number;
  group?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'biller', 'coder', 'provider'], group: 'Main' },
  { id: 'patients', label: 'Patients', icon: Users, roles: ['admin', 'biller', 'coder', 'provider'], group: 'Main' },
  { id: 'scheduling', label: 'Scheduling', icon: Calendar, roles: ['admin', 'biller', 'provider'], group: 'Main' },
  { id: 'notes', label: 'Clinical Notes', icon: Stethoscope, roles: ['admin', 'provider', 'coder'], group: 'Clinical' },
  { id: 'rx', label: 'E-Prescriptions', icon: Pill, roles: ['admin', 'provider'], group: 'Clinical' },
  { id: 'billing', label: 'Charge Entry', icon: FileText, roles: ['admin', 'biller', 'coder', 'provider'], group: 'Billing' },
  { id: 'priorauth', label: 'Prior Auth', icon: ShieldCheck, roles: ['admin', 'biller', 'provider'], group: 'Billing' },
  { id: 'claims', label: 'Claims', icon: ClipboardList, roles: ['admin', 'biller'], badge: 3, group: 'Billing' },
  { id: 'payments', label: 'Payments', icon: CreditCard, roles: ['admin', 'biller'], group: 'Billing' },
  { id: 'era', label: 'ERA Posting', icon: Zap, roles: ['admin', 'biller'], group: 'Billing' },
  { id: 'ar', label: 'AR Management', icon: TrendingUp, roles: ['admin', 'biller'], group: 'Billing' },
  { id: 'statement', label: 'Patient Statement', icon: Receipt, roles: ['admin', 'biller'], group: 'Billing' },
  { id: 'coding', label: 'Coding', icon: Code, roles: ['admin', 'coder', 'provider'], group: 'Analytics' },
  { id: 'reports', label: 'Reports', icon: BarChart3, roles: ['admin', 'biller'], group: 'Analytics' },
  { id: 'users', label: 'Users & Roles', icon: Shield, roles: ['admin'], group: 'Admin' },
  { id: 'audit', label: 'Audit Log', icon: DollarSign, roles: ['admin'], group: 'Admin' },
];

export default function Sidebar() {
  const { currentUser, activeModule, sidebarCollapsed, setActiveModule, toggleSidebar, logout } = useAppStore();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(currentUser.role));

  // Group items
  const groups: Record<string, NavItem[]> = {};
  visibleItems.forEach(item => {
    const g = item.group || 'Main';
    if (!groups[g]) groups[g] = [];
    groups[g].push(item);
  });

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <aside className={cn('flex flex-col h-full bg-[hsl(var(--sidebar-bg))] transition-all duration-300 relative', sidebarCollapsed ? 'w-16' : 'w-60')}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-[hsl(var(--sidebar-border))]">
        <div className="w-8 h-8 rounded-lg bg-[hsl(var(--teal))] flex items-center justify-center flex-shrink-0">
          <Activity className="w-5 h-5 text-white" />
        </div>
        {!sidebarCollapsed && (
          <div>
            <span className="text-white font-bold text-lg leading-none">MediFlow</span>
            <p className="text-[hsl(var(--sidebar-foreground))]/60 text-[10px] mt-0.5">Practice Management</p>
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-5 w-6 h-6 rounded-full bg-[hsl(var(--teal))] text-white flex items-center justify-center shadow-md hover:bg-[hsl(var(--teal-dark))] transition-colors z-10"
      >
        {sidebarCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* Nav Items */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        {Object.entries(groups).map(([groupName, items]) => (
          <div key={groupName} className="mb-2">
            {!sidebarCollapsed && (
              <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--sidebar-foreground))]/40">
                {groupName}
              </p>
            )}
            <div className="space-y-0.5">
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveModule(item.id)}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={cn('nav-item w-full', isActive ? 'nav-item-active' : 'nav-item-inactive', sidebarCollapsed && 'justify-center px-0')}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {!sidebarCollapsed && <span className="flex-1 text-left">{item.label}</span>}
                    {!sidebarCollapsed && item.badge && (
                      <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Card + Logout */}
      <div className={cn('border-t border-[hsl(var(--sidebar-border))] p-3', sidebarCollapsed ? 'px-2' : 'px-3')}>
        <div className={cn('flex items-center gap-3', sidebarCollapsed && 'justify-center')}>
          <div className="w-8 h-8 rounded-full bg-[hsl(var(--teal))]/20 border border-[hsl(var(--teal))]/40 flex items-center justify-center flex-shrink-0">
            <span className="text-[hsl(var(--teal))] text-xs font-bold">
              {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </span>
          </div>
          {!sidebarCollapsed && (
            <div className="overflow-hidden flex-1">
              <p className="text-white text-xs font-medium truncate">{currentUser.name}</p>
              <p className="text-[hsl(var(--sidebar-foreground))]/50 text-[10px] capitalize">{currentUser.role}</p>
            </div>
          )}
          {!sidebarCollapsed && (
            <button
              onClick={handleLogout}
              className="w-7 h-7 rounded hover:bg-white/10 flex items-center justify-center flex-shrink-0 transition-colors"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5 text-[hsl(var(--sidebar-foreground))]/60 hover:text-white" />
            </button>
          )}
        </div>
        {sidebarCollapsed && (
          <button onClick={handleLogout} className="w-full mt-2 flex items-center justify-center" title="Logout">
            <LogOut className="w-3.5 h-3.5 text-[hsl(var(--sidebar-foreground))]/60" />
          </button>
        )}
      </div>
    </aside>
  );
}
