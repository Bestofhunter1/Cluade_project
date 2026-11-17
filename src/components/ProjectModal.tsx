import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Calendar, DollarSign, Briefcase, AlertTriangle, FileText } from 'lucide-react';
import type { Project, Department, RiskLevel } from '../types';

interface ProjectModalProps {
  project?: Project | null;
  onClose: () => void;
  onSubmit: (data: Partial<Project>) => void;
  title: string;
}

const departments: Department[] = [
  'engineering', 'design', 'product', 'data', 'devops', 'qa',
  'management', 'hr', 'finance', 'marketing', 'sales', 'operations',
  'robotics', 'inventory', 'fulfillment', 'warehouse_ops'
];

const statuses: Project['status'][] = ['planning', 'active', 'on_hold', 'completed', 'cancelled'];
const riskLevels: RiskLevel[] = ['low', 'medium', 'high'];

function ProjectModal({ project, onClose, onSubmit, title }: ProjectModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Partial<Project>>({
    code: '',
    name: '',
    description: '',
    department: 'engineering',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    budget: 0,
    status: 'planning',
    progress: 0,
    riskLevel: 'medium',
    riskNotes: '',
    testingDate: '',
    deploymentDate: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (project) {
      setFormData({
        code: project.code,
        name: project.name,
        description: project.description,
        department: project.department,
        startDate: project.startDate,
        endDate: project.endDate,
        budget: project.budget,
        status: project.status,
        progress: project.progress,
        riskLevel: project.riskLevel,
        riskNotes: project.riskNotes,
        testingDate: project.testingDate || '',
        deploymentDate: project.deploymentDate || '',
      });
    }
  }, [project]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.code) newErrors.code = t('validation.required');
    if (!formData.name) newErrors.name = t('validation.required');
    if (!formData.description) newErrors.description = t('validation.required');
    if (!formData.budget || formData.budget <= 0) newErrors.budget = t('validation.positiveNumber');
    if (!formData.startDate) newErrors.startDate = t('validation.required');
    if (!formData.endDate) newErrors.endDate = t('validation.required');
    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = t('validation.dateRange');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const projectData: Partial<Project> = {
        ...formData,
        id: project?.id || `proj-${Date.now()}`,
        createdAt: project?.createdAt || new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        personnelCost: project?.personnelCost || 0,
        otherCosts: project?.otherCosts || [],
        monthlyProgress: project?.monthlyProgress || [],
        allocations: project?.allocations || [],
      };
      onSubmit(projectData);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-xl font-semibold text-primary-text">{title}</h2>
          <button onClick={onClose} className="p-2 text-primary-text-muted hover:text-primary-text hover:bg-primary-hover rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">{t('projects.projectCode')}</label>
              <div className="relative">
                <FileText className="input-icon" />
                <input
                  type="text"
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="input pl-10"
                  placeholder={t('projects.projectCode')}
                  disabled={!!project}
                />
              </div>
              {errors.code && <p className="form-error">{errors.code}</p>}
            </div>

            <div>
              <label className="form-label">{t('projects.projectName')}</label>
              <div className="relative">
                <Briefcase className="input-icon" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="input pl-10"
                  placeholder={t('projects.projectName')}
                />
              </div>
              {errors.name && <p className="form-error">{errors.name}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="form-label">{t('common.description')}</label>
              <div className="relative">
                <FileText className="input-icon" />
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="input pl-10 min-h-[100px] resize-y"
                  placeholder={t('common.description')}
                />
              </div>
              {errors.description && <p className="form-error">{errors.description}</p>}
            </div>

            <div>
              <label className="form-label">{t('projects.department')}</label>
              <select
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value as Department })}
                className="input"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{t(`departments.${dept}`)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">{t('common.status')}</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                className="input"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{t(`projectStatuses.${status}`)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">{t('projects.startDate')}</label>
              <div className="relative">
                <Calendar className="input-icon" />
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  className="input pl-10"
                />
              </div>
              {errors.startDate && <p className="form-error">{errors.startDate}</p>}
            </div>

            <div>
              <label className="form-label">{t('projects.endDate')}</label>
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

            <div>
              <label className="form-label">{t('projects.testingDate')}</label>
              <div className="relative">
                <Calendar className="input-icon" />
                <input
                  type="date"
                  value={formData.testingDate}
                  onChange={e => setFormData({ ...formData, testingDate: e.target.value })}
                  className="input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="form-label">{t('projects.deploymentDate')}</label>
              <div className="relative">
                <Calendar className="input-icon" />
                <input
                  type="date"
                  value={formData.deploymentDate}
                  onChange={e => setFormData({ ...formData, deploymentDate: e.target.value })}
                  className="input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="form-label">{t('projects.budget')}</label>
              <div className="relative">
                <DollarSign className="input-icon" />
                <input
                  type="number"
                  value={formData.budget}
                  onChange={e => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                  className="input pl-10"
                  placeholder={t('projects.budget')}
                  min="0"
                  step="10000"
                />
              </div>
              {errors.budget && <p className="form-error">{errors.budget}</p>}
            </div>

            <div>
              <label className="form-label">{t('projects.progress')}</label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.progress || 0}
                onChange={e => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                className="w-full h-2 bg-primary-border rounded-lg appearance-none accent-primary-accent"
              />
              <p className="text-sm text-primary-text-muted mt-1">{formData.progress}%</p>
            </div>

            <div>
              <label className="form-label">{t('projects.riskLevel')}</label>
              <select
                value={formData.riskLevel}
                onChange={e => setFormData({ ...formData, riskLevel: e.target.value as RiskLevel })}
                className="input"
              >
                {riskLevels.map(risk => (
                  <option key={risk} value={risk}>{t(`riskLevels.${risk}`)}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="form-label">{t('projects.riskNotes')}</label>
              <div className="relative">
                <AlertTriangle className="input-icon" />
                <textarea
                  value={formData.riskNotes}
                  onChange={e => setFormData({ ...formData, riskNotes: e.target.value })}
                  className="input pl-10 min-h-[80px] resize-y"
                  placeholder={t('projects.riskNotes')}
                />
              </div>
            </div>
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

export default ProjectModal;