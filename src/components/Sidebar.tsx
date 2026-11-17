import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../store/authStore';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  ClipboardList,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const navigation = [
  { path: '/dashboard', labelKey: 'navigation.dashboard', icon: LayoutDashboard, roles: ['hr', 'ceo', 'employee'] },
  { path: '/employees', labelKey: 'navigation.employees', icon: Users, roles: ['hr', 'ceo'] },
  { path: '/projects', labelKey: 'navigation.projects', icon: Briefcase, roles: ['hr', 'ceo'] },
  { path: '/leave-approvals', labelKey: 'navigation.leaveApprovals', icon: ClipboardList, roles: ['hr', 'ceo'] },
  { path: '/settings', labelKey: 'navigation.settings', icon: Settings, roles: ['hr', 'ceo'] },
];

function Sidebar() {
  const { user, logout, hasRole } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const filteredNav = navigation.filter((item) =>
    user ? item.roles.includes(user.role) : false
  );

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-50 bg-primary-card border-r border-primary-border transition-all duration-300 flex flex-col ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-primary-border">
        {!collapsed && (
          <NavLink to="/dashboard" className="flex items-center gap-2 text-primary-text font-bold text-lg">
            <div className="w-8 h-8 bg-primary-accent rounded-lg flex items-center justify-center">
              <span className="text-primary-bg font-extrabold text-sm">TW</span>
            </div>
            <span>TechWarehouse</span>
          </NavLink>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-primary-hover transition-colors text-primary-text-muted hover:text-primary-text"
          aria-label={collapsed ? t('common.expand') : t('common.collapse')}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" role="navigation" aria-label={t('navigation.main')}>
        {filteredNav.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary-accent/10 text-primary-accent border border-primary-accent/20'
                  : 'text-primary-text-muted hover:text-primary-text hover:bg-primary-hover'
              } ${collapsed ? 'justify-center' : ''}`}
              aria-current={isActive ? 'page' : undefined}
              title={collapsed ? t(item.labelKey) : undefined}
            >
              <Icon size={20} className="flex-shrink-0" aria-hidden="true" />
              {!collapsed && <span className="font-medium">{t(item.labelKey)}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-primary-border">
        {!collapsed ? (
          <div className="space-y-2">
            <div className="px-3 py-2">
              <p className="text-xs text-primary-text-muted uppercase tracking-wider mb-2">
                {t('common.account')}
              </p>
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-8 h-8 bg-primary-accent rounded-full flex items-center justify-center text-primary-bg font-bold text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-primary-text font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-primary-text-muted capitalize">{user?.role}</p>
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-primary-text-muted hover:text-primary-danger hover:bg-primary-hover transition-colors"
            >
              <LogOut size={20} />
              <span>{t('common.logout')}</span>
            </button>
          </div>
        ) : (
          <button
            onClick={logout}
            className="w-full flex items-center justify-center px-3 py-2 rounded-lg text-primary-text-muted hover:text-primary-danger hover:bg-primary-hover transition-colors"
            title={t('common.logout')}
          >
            <LogOut size={20} />
          </button>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;