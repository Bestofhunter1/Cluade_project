import { useTranslation } from 'react-i18next';
import { useLanguage } from '../store/languageStore';
import { Bell, Search, User, Globe, Moon, Sun } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

function Header() {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setShowLanguageMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-primary-card border-b border-primary-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40">
      <div className="flex-1 max-w-xl mx-auto lg:mx-0 lg:max-w-none">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-text-muted size-5" aria-hidden="true" />
          <input
            type="search"
            placeholder={t('common.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-primary-bg border border-primary-border rounded-lg text-primary-text placeholder-primary-text-muted focus:outline-none focus:ring-2 focus:ring-primary-accent focus:border-transparent transition-all"
            aria-label={t('common.search')}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        <div className="relative" ref={langMenuRef}>
          <button
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            className="flex items-center gap-2 px-3 py-2 bg-primary-bg border border-primary-border rounded-lg text-primary-text hover:bg-primary-hover transition-colors"
            aria-expanded={showLanguageMenu}
            aria-haspopup="true"
            aria-label={t('common.language')}
          >
            <Globe size={18} />
            <span className="hidden sm:inline font-medium capitalize">{language === 'th' ? 'TH' : 'EN'}</span>
          </button>
          {showLanguageMenu && (
            <div className="absolute right-0 top-full mt-2 w-32 bg-primary-card border border-primary-border rounded-lg shadow-lg py-1 z-50 animate-fade-in">
              <button
                onClick={() => { setLanguage('th'); setShowLanguageMenu(false); }}
                className="w-full px-3 py-2 text-left text-primary-text hover:bg-primary-hover transition-colors flex items-center gap-2"
              >
                <span className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">TH</span>
                <span>{t('common.thai')}</span>
                {language === 'th' && <span className="ml-auto text-primary-accent">✓</span>}
              </button>
              <button
                onClick={() => { setLanguage('en'); setShowLanguageMenu(false); }}
                className="w-full px-3 py-2 text-left text-primary-text hover:bg-primary-hover transition-colors flex items-center gap-2"
              >
                <span className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">EN</span>
                <span>{t('common.english')}</span>
                {language === 'en' && <span className="ml-auto text-primary-accent">✓</span>}
              </button>
            </div>
          )}
        </div>

        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 bg-primary-bg border border-primary-border rounded-lg text-primary-text-muted hover:text-primary-text hover:bg-primary-hover transition-colors"
            aria-expanded={showNotifications}
            aria-haspopup="true"
            aria-label={t('common.notifications')}
          >
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-danger text-primary-bg text-xs font-bold rounded-full flex items-center justify-center">
              3
            </span>
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-primary-card border border-primary-border rounded-lg shadow-lg z-50 animate-fade-in max-h-96 overflow-y-auto">
              <div className="px-4 py-3 border-b border-primary-border flex items-center justify-between">
                <h3 className="font-semibold text-primary-text">{t('common.notifications')}</h3>
                <button className="text-primary-text-muted hover:text-primary-text" aria-label={t('common.clear')}>
                  {t('common.clear')}
                </button>
              </div>
              <div className="py-2">
                {[
                  { title: t('notifications.leaveRequest'), message: t('notifications.leaveRequestMessage', { name: 'John Doe', type: t('leaveTypes.annual') }), time: t('notifications.twoHoursAgo'), unread: true },
                  { title: t('notifications.projectUpdate'), message: t('notifications.projectOverBudget', { code: 'P002', percent: 15 }), time: t('notifications.fiveHoursAgo'), unread: true },
                  { title: t('notifications.newEmployee'), message: t('notifications.employeeJoined', { name: 'Jane Smith', department: t('departments.engineering') }), time: t('notifications.oneDayAgo'), unread: false },
                ].map((notif, i) => (
                  <button key={i} className="w-full px-4 py-3 hover:bg-primary-hover transition-colors text-left border-b border-primary-border/50 last:border-0">
                    <p className={`font-medium text-primary-text ${notif.unread ? '' : 'text-primary-text-muted'}`}>{notif.title}</p>
                    <p className="text-sm text-primary-text-muted mt-1">{notif.message}</p>
                    <p className="text-xs text-primary-text-muted mt-1">{notif.time}</p>
                  </button>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-primary-border">
                <button className="w-full text-center text-primary-accent hover:text-primary-accent/80 text-sm font-medium">
                  {t('common.viewAll')}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-2 bg-primary-bg border border-primary-border rounded-lg hover:bg-primary-hover transition-colors"
            aria-expanded={showUserMenu}
            aria-haspopup="true"
            aria-label={t('common.profile')}
          >
            <User size={20} className="text-primary-text-muted" />
          </button>
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-primary-card border border-primary-border rounded-lg shadow-lg py-1 z-50 animate-fade-in">
              <div className="px-4 py-3 border-b border-primary-border">
                <p className="font-medium text-primary-text truncate">HR Manager</p>
                <p className="text-sm text-primary-text-muted">hr@techwarehouse.com</p>
              </div>
              <button className="w-full px-4 py-2 text-left text-primary-text hover:bg-primary-hover transition-colors flex items-center gap-2">
                <User size={16} />
                {t('common.profile')}
              </button>
              <button className="w-full px-4 py-2 text-left text-primary-text hover:bg-primary-hover transition-colors flex items-center gap-2 text-primary-danger">
                <LogOut size={16} />
                {t('common.logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

import { LogOut } from 'lucide-react';

export default Header;