import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Calendar, FileText } from 'lucide-react';
import type { MonthlyProgress } from '../types';

interface ProgressModalProps {
  projectId: string;
  onClose: () => void;
  onSubmit: (data: Partial<MonthlyProgress>) => void;
  progress?: MonthlyProgress | null;
  t: (key: string) => string;
}

function ProgressModal({ projectId, onClose, onSubmit, progress, t }: ProgressModalProps) {
  const [formData, setFormData] = useState<Partial<MonthlyProgress>>({
    month: '',
    progressPercent: 0,
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentMonth = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    if (progress) {
      setFormData({
        month: progress.month,
        progressPercent: progress.progressPercent,
        notes: progress.notes || '',
      });
    } else {
      setFormData({
        month: currentMonth,
        progressPercent: 0,
        notes: '',
      });
    }
  }, [progress, currentMonth]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.month) newErrors.month = t('validation.required');
    if (formData.progressPercent === undefined || formData.progressPercent < 0 || formData.progressPercent > 100) {
      newErrors.progressPercent = t('validation.percentage');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal max-w-md" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-xl font-semibold text-primary-text">{progress ? t('projects.editProgress') : t('projects.updateProgress')}</h2>
          <button onClick={onClose} className="p-2 text-primary-text-muted hover:text-primary-text hover:bg-primary-hover rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="form-label">{t('projects.month')}</label>
            <div className="relative">
              <Calendar className="input-icon" />
              <input
                type="month"
                value={formData.month}
                onChange={e => setFormData({ ...formData, month: e.target.value })}
                className="input pl-10"
                required
                max={currentMonth}
              />
            </div>
            {errors.month && <p className="form-error">{errors.month}</p>}
          </div>

          <div>
            <label className="form-label">{t('projects.progressPercent')}</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={formData.progressPercent}
                onChange={e => setFormData({ ...formData, progressPercent: parseInt(e.target.value) })}
                className="flex-1 h-2 bg-primary-border rounded-lg appearance-none accent-primary-accent"
              />
              <input
                type="number"
                value={formData.progressPercent}
                onChange={e => setFormData({ ...formData, progressPercent: parseInt(e.target.value) || 0 })}
                className="input w-20 text-center"
                min="0"
                max="100"
              />
            </div>
            {errors.progressPercent && <p className="form-error">{errors.progressPercent}</p>}
          </div>

          <div>
            <label className="form-label">{t('projects.progressNote')}</label>
            <div className="relative">
              <FileText className="input-icon" />
              <textarea
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                className="input pl-10 min-h-[80px] resize-y"
                placeholder={t('projects.progressNote')}
              />
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

export default ProgressModal;