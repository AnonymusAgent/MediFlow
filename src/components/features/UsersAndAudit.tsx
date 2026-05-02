import { MOCK_USERS, MOCK_AUDIT_LOGS } from '@/constants/mockData';
import { User, UserRole } from '@/types';
import { formatDateTime, cn } from '@/lib/utils';
import { Plus, Shield, Edit, ToggleLeft, Clock, User as UserIcon } from 'lucide-react';
import { useState } from 'react';

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['Full system access', 'User management', 'All reports', 'Audit logs', 'System settings', 'All billing modules'],
  biller: ['Charge entry', 'Claims management', 'Payment posting', 'AR management', 'Financial reports'],
  coder: ['ICD-10 / CPT lookup', 'Coding review', 'Charge entry (limited)', 'Coding guidelines'],
  provider: ['Patient records', 'Scheduling', 'Charge entry (own)', 'Clinical documentation'],
};

const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'text-purple-700 bg-purple-50 border-purple-200',
  biller: 'text-blue-700 bg-blue-50 border-blue-200',
  coder: 'text-teal-700 bg-teal-50 border-teal-200',
  provider: 'text-emerald-700 bg-emerald-50 border-emerald-200',
};

export default function UsersAndAudit() {
  const [view, setView] = useState<'users' | 'audit'>('users');
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users, Roles & Audit</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage access control and activity tracking</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-muted rounded-lg p-1">
            {(['users', 'audit'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn('px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors',
                  view === v ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {v === 'users' ? 'Users & Roles' : 'Audit Log'}
              </button>
            ))}
          </div>
          {view === 'users' && (
            <button className="btn-primary" onClick={() => setShowAdd(true)}>
              <Plus className="w-4 h-4" /> Add User
            </button>
          )}
        </div>
      </div>

      {view === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Users Table */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-4 py-3 label-text">User</th>
                    <th className="text-left px-4 py-3 label-text">Role</th>
                    <th className="text-left px-4 py-3 label-text hidden md:table-cell">Specialty / NPI</th>
                    <th className="text-left px-4 py-3 label-text">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {MOCK_USERS.map(user => (
                    <tr key={user.id} className="table-row-hover">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[hsl(var(--primary))]/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-[hsl(var(--primary))] text-xs font-bold">
                              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-xs">{user.name}</p>
                            <p className="text-[10px] text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('badge-status border capitalize', ROLE_COLORS[user.role])}>
                          <Shield className="w-3 h-3" /> {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
                        {user.specialty || '—'}{user.npi ? ` (NPI: ${user.npi})` : ''}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button className="w-7 h-7 rounded hover:bg-muted flex items-center justify-center">
                            <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                          <button className="w-7 h-7 rounded hover:bg-muted flex items-center justify-center">
                            <ToggleLeft className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Role Permissions */}
          <div className="space-y-3">
            <h3 className="section-title">Role Permissions</h3>
            {(Object.entries(ROLE_PERMISSIONS) as [UserRole, string[]][]).map(([role, permissions]) => (
              <div key={role} className="stat-card">
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn('badge-status border capitalize', ROLE_COLORS[role])}>
                    <Shield className="w-3 h-3" /> {role}
                  </span>
                </div>
                <ul className="space-y-1">
                  {permissions.map(p => (
                    <li key={p} className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-[hsl(var(--teal))] rounded-full flex-shrink-0"></span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'audit' && (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <h3 className="section-title">Activity Audit Log</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 label-text">Timestamp</th>
                <th className="text-left px-4 py-3 label-text">User</th>
                <th className="text-left px-4 py-3 label-text">Action</th>
                <th className="text-left px-4 py-3 label-text hidden md:table-cell">Module</th>
                <th className="text-left px-4 py-3 label-text hidden lg:table-cell">Details</th>
                <th className="text-left px-4 py-3 label-text hidden xl:table-cell">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MOCK_AUDIT_LOGS.map(log => (
                <tr key={log.id} className="table-row-hover">
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{formatDateTime(log.timestamp)}</td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-medium">{log.userName}</p>
                    <span className={cn('badge-status border capitalize text-[10px]', ROLE_COLORS[log.userRole])}>
                      {log.userRole}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold text-[hsl(var(--primary))]">{log.action}</span>
                  </td>
                  <td className="px-4 py-3 text-xs hidden md:table-cell">{log.module}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell max-w-xs truncate">{log.details}</td>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground hidden xl:table-cell">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-bold">Add New User</h2>
              <button onClick={() => setShowAdd(false)} className="text-muted-foreground hover:text-foreground text-xl">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text block mb-1">First Name *</label>
                  <input className="input-field" placeholder="First name" />
                </div>
                <div>
                  <label className="label-text block mb-1">Last Name *</label>
                  <input className="input-field" placeholder="Last name" />
                </div>
              </div>
              <div>
                <label className="label-text block mb-1">Email *</label>
                <input type="email" className="input-field" placeholder="user@mediflow.com" />
              </div>
              <div>
                <label className="label-text block mb-1">Role *</label>
                <select className="select-field">
                  <option value="biller">Biller</option>
                  <option value="coder">Coder</option>
                  <option value="provider">Provider</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="label-text block mb-1">NPI Number (Providers)</label>
                <input className="input-field" placeholder="10-digit NPI" />
              </div>
            </div>
            <div className="px-5 pb-5 flex justify-end gap-2">
              <button className="btn-outline" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => setShowAdd(false)}>Create User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
