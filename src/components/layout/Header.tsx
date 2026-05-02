import { Bell, Search, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { MOCK_USERS } from '@/constants/mockData';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function Header() {
  const { currentUser, setCurrentUser, logout } = useAppStore();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  if (!currentUser) return null;

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const notifications = [
    { id: 1, text: 'Claim CLM-2026-001235 denied by Aetna', time: '10 min ago', type: 'error' },
    { id: 2, text: 'ERA received from Medicare - $1,240.50', time: '1 hr ago', type: 'success' },
    { id: 3, text: 'Eligibility verified for Jennifer Williams', time: '2 hrs ago', type: 'info' },
    { id: 4, text: '3 claims require scrubbing review', time: '3 hrs ago', type: 'warning' },
  ];

  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 gap-4 flex-shrink-0">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search patients, claims, providers..."
          className="w-full pl-9 pr-4 py-1.5 text-sm border border-border rounded-md bg-muted/30 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--teal))]/30 focus:border-[hsl(var(--teal))] transition-colors"
        />
      </div>

      <div className="flex items-center gap-3">
        {/* Today's date */}
        <span className="text-xs text-muted-foreground hidden md:block">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </span>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
            className="relative w-9 h-9 rounded-md border border-border hover:bg-muted flex items-center justify-center transition-colors"
          >
            <Bell className="w-4 h-4 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-11 w-80 bg-card border border-border rounded-lg shadow-xl z-50">
              <div className="px-4 py-3 border-b border-border">
                <h3 className="font-semibold text-sm">Notifications</h3>
              </div>
              <div className="divide-y divide-border">
                {notifications.map(n => (
                  <div key={n.id} className="px-4 py-3 hover:bg-muted/30 cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className={cn('w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                        n.type === 'error' ? 'bg-red-500' :
                        n.type === 'success' ? 'bg-emerald-500' :
                        n.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                      )} />
                      <div>
                        <p className="text-xs text-foreground">{n.text}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-border">
                <button className="text-xs text-[hsl(var(--teal))] hover:underline">View all notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher / User Menu */}
        <div className="relative">
          <button
            onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-md border border-border hover:bg-muted transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-[hsl(var(--primary))]/10 flex items-center justify-center">
              <span className="text-[hsl(var(--primary))] text-[10px] font-bold">
                {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </span>
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-medium leading-none">{currentUser.name.split(' ')[0]}</p>
              <p className="text-[10px] text-muted-foreground capitalize">{currentUser.role}</p>
            </div>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-11 w-64 bg-card border border-border rounded-lg shadow-xl z-50">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-medium">{currentUser.name}</p>
                <p className="text-xs text-muted-foreground">{currentUser.email}</p>
              </div>
              <div className="py-2">
                <p className="px-4 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Switch Role (Demo)</p>
                {MOCK_USERS.map(user => (
                  <button
                    key={user.id}
                    onClick={() => { setCurrentUser(user); setShowUserMenu(false); }}
                    className={cn(
                      'w-full text-left px-4 py-2 text-xs hover:bg-muted transition-colors flex items-center justify-between',
                      currentUser.id === user.id && 'bg-[hsl(var(--teal))]/10 text-[hsl(var(--teal))]'
                    )}
                  >
                    <span>{user.name}</span>
                    <span className="capitalize text-muted-foreground">{user.role}</span>
                  </button>
                ))}
              </div>
              <div className="border-t border-border py-2">
                <button className="w-full text-left px-4 py-2 text-xs hover:bg-muted transition-colors flex items-center gap-2 text-muted-foreground">
                  <Settings className="w-3.5 h-3.5" /> Settings
                </button>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-xs hover:bg-muted transition-colors flex items-center gap-2 text-red-500">
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
