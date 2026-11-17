import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, DollarSign, Calendar, CreditCard, Tag, Building2 } from 'lucide-react';
import type { OtherCost, CostCategory } from '../types';

interface CostModalProps {
  projectId: string;
  onClose: () => void;
  onSubmit: (data: Partial<OtherCost>) => void;
  cost?: OtherCost | null;
  t: (key: string) => string;
}

const categories: CostCategory[] = ['software_license', 'cloud', 'hardware', 'vendor', 'personnel'];

function CostModal({ projectId, onClose, onSubmit, cost, t }: CostModalProps) {
  const [formData, setFormData] = useState<Partial<OtherCost>>({
    category: 'software_license',
    name: '',
    description: '',
    amount: 0,
    isRecurring: false,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    vendor: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (cost) {
      setFormData({
        category: cost.category,
        name: cost.name,
        description: cost.description,
        amount: cost.amount,
        isRecurring: cost.isRecurring,
        startDate: cost.startDate,
        endDate: cost.endDate || '',
        vendor: cost.vendor || '',
      });
    } else {
      setFormData({
        ...formData,
        startDate: new Date().toISOString().split('T')[0],
      });
    }
  }, [cost]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = t('validation.required');
    if (!formData.amount || formData.amount <= 0) newErrors.amount = t('validation.positiveNumber');
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
      onSubmit(formData);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal max-w-md" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-xl font-semibold text-primary-text">{cost ? t('projects.editCost') : t('projects.addCost')}</h2>
          <button onClick={onClose} className="p-2 text-primary-text-muted hover:text-primary-text hover:bg-primary-hover rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="form-label">{t('projects.costCategory')}</label>
            <select
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value as CostCategory })}
              className="input"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{t(`costCategories.${cat}`)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">{t('projects.costName')}</label>
            <div className="relative">
              <Tag className="input-icon" />
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="input pl-10"
                placeholder={t('projects.costName')}
              />
            </div>
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>

          <div>
            <label className="form-label">{t('common.description')}</label>
            <div className="relative">
              <Tag className="input-icon" />
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="input pl-10 min-h-[80px] resize-y"
                placeholder={t('common.description')}
              />
            </div>
          </div>

          <div>
            <label className="form-label">{t('projects.costAmount')}</label>
            <div className="relative">
              <DollarSign className="input-icon" />
              <input
                type="number"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className="input pl-10"
                placeholder={t('projects.costAmount')}
                min="0"
                step="1000"
              />
            </div>
            {errors.amount && <p className="form-error">{errors.amount}</p>}
          </div>

          <div>
            <label className="form-label flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isRecurring}
                onChange={e => setFormData({ ...formData, isRecurring: e.target.checked })}
                className="w-4 h-4 rounded border-primary-border text-primary-accent focus:ring-primary-accent bg-primary-bg"
              />
              {t('projects.isRecurring')}
            </label>
          </div>

          <div>
            <label className="form-label">{t('projects.costStartDate')}</label>
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
            <label className="form-label">{t('projects.costEndDate')}</label>
            <div className="relative">
              <Calendar className="input-icon" />
              <input
                type="date"
                value={formData.endDate}
                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                className="input pl-10"
                disabled={!formData.isRecurring}
              />
            </div>
            {errors.endDate && <p className="form-error">{errors.endDate}</p>}
          </div>

          <div>
            <label className="form-label">{t('projects.vendor')}</label>
            <div className="relative">
              <Building2 className="input-icon" />
              <input
                type="text"
                value={formData.vendor}
                onChange={e => setFormData({ ...formData, vendor: e.target.value })}
                className="input pl-10"
                placeholder={t('projects.vendor')}
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

export default CostModal;