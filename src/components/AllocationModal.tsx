import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Users, Calendar, Briefcase } from 'lucide-react';
import type { ProjectAllocation, Employee, ProjectRole } from '../types';

interface AllocationModalProps {
  projectId: string;
  employees: Employee[];
  onClose: () => void;
  onSubmit: (data: Partial<ProjectAllocation>) => void;
  allocation?: ProjectAllocation | null;
  t: (key: string) => string;
}

const roles: ProjectRole[] = ['lead', 'senior', 'mid', 'junior', 'intern', 'consultant'];

function AllocationModal({ projectId, employees, onClose, onSubmit, allocation, t }: AllocationModalProps) {
  const [formData, setFormData] = useState<Partial<ProjectAllocation>>({
    projectId: '',
    role: 'mid',
    allocationPercent: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableEmployees = employees.filter(e =>
    e.status === 'working'
  );

  useEffect(() => {
    if (allocation) {
      setFormData({
        projectId: allocation.projectId,
        role: allocation.role,
        allocationPercent: allocation.allocationPercent,
        startDate: allocation.startDate,
        endDate: allocation.endDate || '',
      });
    } else {
      setFormData({
        ...formData,
        startDate: new Date().toISOString().split('T')[0],
      });
    }
  }, [allocation]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.projectId) newErrors.projectId = t('validation.required');
    if (!formData.allocationPercent || formData.allocationPercent <= 0) newErrors.allocationPercent = t('validation.positiveNumber');
    if (formData.allocationPercent && formData.allocationPercent > 100) newErrors.allocationPercent = t('validation.percentage');
    if (!formData.startDate) newErrors.startDate = t('validation.required');
    if (formData.endDate && formData.startDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = t('validation.dateRange');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const emp = employees.find(e => e.id === formData.projectId);
      onSubmit({
        ...formData,
        projectName: emp?.name || '',
      } as ProjectAllocation);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal max-w-md" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-xl font-semibold text-primary-text">{allocation ? t('projects.editAllocation') : t('projects.addAllocation')}</h2>
          <button onClick={onClose} className="p-2 text-primary-text-muted hover:text-primary-text hover:bg-primary-hover rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="form-label">{t('projects.selectEmployee')}</label>
            <select
              value={formData.projectId}
              onChange={e => setFormData({ ...formData, projectId: e.target.value })}
              className="input"
              required
            >
              <option value="">{t('projects.selectEmployee')}</option>
              {availableEmployees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.code} - {emp.firstName} {emp.lastName} ({t(`departments.${emp.department}`)})
                </option>
              ))}
            </select>
            {errors.projectId && <p className="form-error">{errors.projectId}</p>}
          </div>

          <div>
            <label className="form-label">{t('projects.projectRole')}</label>
            <select
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value as ProjectRole })}
              className="input"
            >
              {roles.map(role => (
                <option key={role} value={role}>{t(`projects.${role}`)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">{t('projects.allocationPercent')}</label>
            <div className="relative">
              <Users className="input-icon" />
              <input
                type="number"
                value={formData.allocationPercent}
                onChange={e => setFormData({ ...formData, allocationPercent: parseInt(e.target.value) || 0 })}
                className="input pl-10"
                placeholder={t('projects.allocationPercent')}
                min="1"
                max="100"
                required
              />
            </div>
            {errors.allocationPercent && <p className="form-error">{errors.allocationPercent}</p>}
          </div>

          <div>
            <label className="form-label">{t('projects.allocationStartDate')}</label>
            <div className="relative">
              <Calendar className="input-icon" />
              <input
                type="date"
                value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                className="input pl-10"
                required
              />
            </div>
            {errors.startDate && <p className="form-error">{errors.startDate}</p>}
          </div>

          <div>
            <label className="form-label">{t('projects.allocationEndDate')}</label>
            <div className="relative">
              <Calendar className="input-icon" />
              <input
                type="date"
                value={formData.endDate}
                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                className="input pl-10"
              />
            </div>
            {errors.endDate && <p className="form-error">{errors.endDate}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-primary-border">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn btn-primary">
              {t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AllocationModal;