import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../store/authStore';
import { useEmployeeStore } from '../store/employeeStore';
import { useProjectStore } from '../store/projectStore';
import { Save, Download, Upload, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import type { Settings as SettingsType } from '../types';

const DEFAULT_SETTINGS: SettingsType = {
  companyName: 'TechWarehouse',
  companyNameTh: 'เทคเวียร์เฮาส์',
  annualLeaveBaseDays: 10,
  annualLeaveAfter3Years: 12,
  annualLeaveAfter5Years: 15,
  maxCarryOverDays: 5,
  carryOverExpiryDate: '03-31',
  sickLeaveEntitlement: 30,
  requiresCeoApproval: true,
  defaultTestingDaysBeforeEnd: 14,
  defaultDeploymentDaysBeforeEnd: 7,
  currency: 'THB',
  locale: 'th',
};

function Settings() {
  const { t } = useTranslation();
  const { hasRole } = useAuth();
  const { employees } = useEmployeeStore();
  const { projects } = useProjectStore();

  const canManage = hasRole(['hr', 'ceo']);
  const [settings, setSettings] = useState<SettingsType>(() => {
    const saved = localStorage.getItem('app-settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [exportData, setExportData] = useState<string>('');
  const [showExport, setShowExport] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importError, setImportError] = useState('');

  const handleSave = () => {
    setSaveStatus('saving');
    try {
      localStorage.setItem('app-settings', JSON.stringify(settings));
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleExport = () => {
    const data = {
      settings,
      employees: employees.map(e => ({
        ...e,
        password: undefined,
        nationalId: undefined,
      })),
      projects,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };
    const json = JSON.stringify(data, null, 2);
    setExportData(json);
    setShowExport(true);
  };

  const handleDownload = () => {
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `techwarehouse-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExport(false);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      setImportError('');
    }
  };

  const handleConfirmImport = () => {
    if (!importFile) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.settings) {
          setSettings(data.settings);
          localStorage.setItem('app-settings', JSON.stringify(data.settings));
        }
        if (data.employees && Array.isArray(data.employees)) {
          // Note: In a real app, this would merge with existing data
          console.log('Employee import:', data.employees.length);
        }
        if (data.projects && Array.isArray(data.projects)) {
          console.log('Project import:', data.projects.length);
        }
        setImportFile(null);
        (e.target as HTMLInputElement).value = '';
      } catch {
        setImportError(t('settings.importError'));
      }
    };
    reader.readAsText(importFile);
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem('app-settings');
  };

  if (!canManage) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle size={48} className="text-primary-warning mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-primary-text mb-2">{t('common.accessDenied')}</h2>
          <p className="text-primary-text-muted">{t('settings.hrCeoOnly')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-primary-text">{t('settings.title')}</h1>
          <p className="text-primary-text-muted mt-1">{t('settings.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          {saveStatus === 'success' && (
            <span className="text-sm text-primary-success flex items-center gap-1">
              <CheckCircle size={14} /> {t('settings.saveSuccess')}
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-sm text-primary-danger flex items-center gap-1">
              <AlertTriangle size={14} /> {t('settings.saveError')}
            </span>
          )}
          <button onClick={handleSave} disabled={saveStatus === 'saving'} className="btn btn-primary flex items-center gap-2">
            <Save size={18} />
            {saveStatus === 'saving' ? t('common.loading') : t('common.save')}
          </button>
        </div>
      </div>

      <div className="card p-6 space-y-8">
        <section>
          <h2 className="text-lg font-semibold text-primary-text mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary-accent/10 flex items-center justify-center">
              <span className="text-primary-accent font-bold">1</span>
            </span>
            {t('settings.general')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">{t('settings.companyName')}</label>
              <input
                type="text"
                value={settings.companyName}
                onChange={e => setSettings({ ...settings, companyName: e.target.value })}
                className="input"
                placeholder={t('settings.companyName')}
              />
            </div>
            <div>
              <label className="form-label">{t('settings.companyNameTh')}</label>
              <input
                type="text"
                value={settings.companyNameTh}
                onChange={e => setSettings({ ...settings, companyNameTh: e.target.value })}
                className="input"
                placeholder={t('settings.companyNameTh')}
              />
            </div>
            <div>
              <label className="form-label">{t('settings.currency')}</label>
              <select
                value={settings.currency}
                onChange={e => setSettings({ ...settings, currency: e.target.value })}
                className="input"
              >
                <option value="THB">THB (Thai Baht)</option>
                <option value="USD">USD (US Dollar)</option>
                <option value="EUR">EUR (Euro)</option>
              </select>
            </div>
            <div>
              <label className="form-label">{t('settings.locale')}</label>
              <select
                value={settings.locale}
                onChange={e => setSettings({ ...settings, locale: e.target.value })}
                className="input"
              >
                <option value="th">Thai</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-primary-text mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary-accent/10 flex items-center justify-center">
              <span className="text-primary-accent font-bold">2</span>
            </span>
            {t('settings.leavePolicy')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="form-label">{t('settings.annualLeaveBaseDays')}</label>
              <input
                type="number"
                value={settings.annualLeaveBaseDays}
                onChange={e => setSettings({ ...settings, annualLeaveBaseDays: parseInt(e.target.value) || 0 })}
                className="input"
                min="0"
                max="30"
              />
            </div>
            <div>
              <label className="form-label">{t('settings.annualLeaveAfter3Years')}</label>
              <input
                type="number"
                value={settings.annualLeaveAfter3Years}
                onChange={e => setSettings({ ...settings, annualLeaveAfter3Years: parseInt(e.target.value) || 0 })}
                className="input"
                min="0"
                max="30"
              />
            </div>
            <div>
              <label className="form-label">{t('settings.annualLeaveAfter5Years')}</label>
              <input
                type="number"
                value={settings.annualLeaveAfter5Years}
                onChange={e => setSettings({ ...settings, annualLeaveAfter5Years: parseInt(e.target.value) || 0 })}
                className="input"
                min="0"
                max="30"
              />
            </div>
            <div>
              <label className="form-label">{t('settings.maxCarryOverDays')}</label>
              <input
                type="number"
                value={settings.maxCarryOverDays}
                onChange={e => setSettings({ ...settings, maxCarryOverDays: parseInt(e.target.value) || 0 })}
                className="input"
                min="0"
                max="30"
              />
            </div>
            <div>
              <label className="form-label">{t('settings.carryOverExpiryDate')}</label>
              <input
                type="month"
                value={settings.carryOverExpiryDate}
                onChange={e => setSettings({ ...settings, carryOverExpiryDate: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="form-label">{t('settings.sickLeaveEntitlement')}</label>
              <input
                type="number"
                value={settings.sickLeaveEntitlement}
                onChange={e => setSettings({ ...settings, sickLeaveEntitlement: parseInt(e.target.value) || 0 })}
                className="input"
                min="0"
                max="60"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="form-label flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.requiresCeoApproval}
                  onChange={e => setSettings({ ...settings, requiresCeoApproval: e.target.checked })}
                  className="w-4 h-4 rounded border-primary-border text-primary-accent focus:ring-primary-accent bg-primary-bg"
                />
                {t('settings.requiresCeoApproval')}
              </label>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-primary-text mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary-accent/10 flex items-center justify-center">
              <span className="text-primary-accent font-bold">3</span>
            </span>
            {t('settings.projectDefaults')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">{t('settings.defaultTestingDaysBeforeEnd')}</label>
              <input
                type="number"
                value={settings.defaultTestingDaysBeforeEnd}
                onChange={e => setSettings({ ...settings, defaultTestingDaysBeforeEnd: parseInt(e.target.value) || 0 })}
                className="input"
                min="0"
                max="90"
              />
            </div>
            <div>
              <label className="form-label">{t('settings.defaultDeploymentDaysBeforeEnd')}</label>
              <input
                type="number"
                value={settings.defaultDeploymentDaysBeforeEnd}
                onChange={e => setSettings({ ...settings, defaultDeploymentDaysBeforeEnd: parseInt(e.target.value) || 0 })}
                className="input"
                min="0"
                max="90"
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-primary-text mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary-accent/10 flex items-center justify-center">
              <span className="text-primary-accent font-bold">4</span>
            </span>
            {t('settings.dataManagement')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-primary-bg/50 rounded-lg border border-primary-border/50">
              <h3 className="font-medium text-primary-text mb-2 flex items-center gap-2">
                <Download size={18} className="text-primary-accent" />
                {t('settings.exportData')}
              </h3>
              <p className="text-sm text-primary-text-muted mb-4">{t('settings.exportDescription')}</p>
              <button onClick={handleExport} className="btn btn-secondary flex items-center gap-2">
                <Download size={16} /> {t('settings.exportData')}
              </button>
            </div>
            <div className="p-4 bg-primary-bg/50 rounded-lg border border-primary-border/50">
              <h3 className="font-medium text-primary-text mb-2 flex items-center gap-2">
                <Upload size={18} className="text-primary-accent" />
                {t('settings.importData')}
              </h3>
              <p className="text-sm text-primary-text-muted mb-4">{t('settings.importDescription')}</p>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="input mb-3"
                style={{ display: 'none' }}
                id="import-file"
                ref={(el) => el && (importFile ? undefined : undefined)}
              />
              <label htmlFor="import-file" className="btn btn-secondary flex items-center gap-2 cursor-pointer">
                <Upload size={16} /> {t('settings.chooseFile')}
              </label>
              {importFile && (
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-primary-text">{importFile.name}</span>
                  <div className="flex gap-2">
                    <button onClick={handleConfirmImport} className="btn btn-primary text-sm">
                      {t('settings.importData')}
                    </button>
                    <button onClick={() => { setImportFile(null); setImportError(''); }} className="btn btn-secondary text-sm">
                      {t('common.cancel')}
                    </button>
                  </div>
                </div>
              )}
              {importError && <p className="text-sm text-primary-danger mt-2">{importError}</p>}
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-primary-text mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary-danger/10 flex items-center justify-center">
              <span className="text-primary-danger font-bold">!</span>
            </span>
            {t('settings.dangerZone')}
          </h2>
          <div className="p-4 bg-primary-danger/10 border border-primary-danger/20 rounded-lg">
            <h3 className="font-medium text-primary-danger mb-2">{t('settings.resetSettings')}</h3>
            <p className="text-sm text-primary-text-muted mb-4">{t('settings.resetDescription')}</p>
            <button onClick={handleReset} className="btn btn-danger">
              <RefreshCw size={16} /> {t('settings.resetSettings')}
            </button>
          </div>
        </section>
      </div>

      {showExport && (
        <div className="modal-overlay" onClick={() => setShowExport(false)}>
          <div className="modal max-w-2xl max-h-[70vh]" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-xl font-semibold text-primary-text">{t('settings.exportData')}</h2>
              <button onClick={() => setShowExport(false)} className="p-2 text-primary-text-muted hover:text-primary-text hover:bg-primary-hover rounded-lg">
                <svg size={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-primary-text-muted mb-4">{t('settings.exportPreview')}</p>
              <div className="bg-primary-bg border border-primary-border rounded-lg p-4 max-h-[50vh] overflow-auto font-mono text-xs text-primary-text">
                <pre>{exportData}</pre>
              </div>
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-primary-border">
                <button onClick={() => setShowExport(false)} className="btn btn-secondary">{t('common.close')}</button>
                <button onClick={handleDownload} className="btn btn-primary flex items-center gap-2">
                  <Download size={16} /> {t('settings.download')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;