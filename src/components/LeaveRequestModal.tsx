import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Calendar, User, Clock, FileText, HelpCircle } from 'lucide-react';
import type { LeaveRequest, LeaveType } from '../types';

interface LeaveRequestModalProps {
  employeeId: string;
  employeeName: string;
  onClose: () => void;
  onSubmit: (data: Omit<LeaveRequest, 'id' | 'employeeId' | 'status' | 'approvalStatus' | 'requestedAt'>) => void;
  leaveRequest?: LeaveRequest | null;
  t: (key: string) => string;
}

const leaveTypes: LeaveType[] = ['annual', 'sick', 'personal', 'maternity', 'paternity', 'bereavement', 'unpaid'];

function LeaveRequestModal({ employeeId, employeeName, onClose, onSubmit, leaveRequest, t }: LeaveRequestModalProps) {
  const [formData, setFormData] = useState({
    type: 'annual' as LeaveType,
    startDate: '',
    endDate: '',
    totalDays: 0,
    reason: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (leaveRequest) {
      setFormData({
        type: leaveRequest.type,
        startDate: leaveRequest.startDate,
        endDate: leaveRequest.endDate,
        totalDays: leaveRequest.totalDays,
        reason: leaveRequest.reason,
      });
    } else {
      setFormData({
        type: 'annual',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        totalDays: 0,
        reason: '',
      });
    }
  }, [leaveRequest]);

  const calculateDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setFormData({ ...formData, totalDays: diffDays });
    }
  };

  useEffect(() => {
    calculateDays();
  }, [formData.startDate, formData.endDate]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.type) newErrors.type = t('validation.required');
    if (!formData.startDate) newErrors.startDate = t('validation.required');
    if (!formData.endDate) newErrors.endDate = t('validation.required');
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = t('validation.dateRange');
    }
    if (!formData.reason.trim()) newErrors.reason = t('validation.required');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate,
        totalDays: formData.totalDays,
        reason: formData.reason,
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal max-w-md" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-xl font-semibold text-primary-text flex items-center gap-2">
            {leaveRequest ? t('employees.editLeaveRequest') : t('employees.requestLeave')}
          </h2>
          <button onClick={onClose} className="p-2 text-primary-text-muted hover:text-primary-text hover:bg-primary-hover rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="form-label">{t('employees.employeeName')}</label>
            <div className="input bg-primary-bg/50 flex items-center gap-3">
              <User size={18} className="text-primary-text-muted" />
              <span className="text-primary-text">{employeeName}</span>
            </div>
          </div>

          <div>
            <label className="form-label">{t('employees.leaveType')}</label>
            <select
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value as LeaveType })}
              className="input"
            >
              {leaveTypes.map(type => (
                <option key={type} value={type}>{t(`leaveTypes.${type}`)}</option>
              ))}
            </select>
            {errors.type && <p className="form-error">{errors.type}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">{t('employees.startDate')}</label>
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
              <label className="form-label">{t('employees.endDate')}</label>
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
          </div>

          <div className="flex items-center justify-between p-3 bg-primary-bg/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-primary-text-muted" />
              <span className="text-sm font-medium text-primary-text">{t('employees.totalDays')}</span>
            </div>
            <span className="text-xl font-bold text-primary-accent">{formData.totalDays} {t('common.days')}</span>
          </div>

          <div>
            <label className="form-label flex items-center gap-2">
              {t('employees.reason')}
              <HelpCircle size={14} className="text-primary-text-muted" />
            </label>
            <textarea
              value={formData.reason}
              onChange={e => setFormData({ ...formData, reason: e.target.value })}
              className="input min-h-[80px] resize-y"
              placeholder={t('employees.reason')}
            />
            {errors.reason && <p className="form-error">{errors.reason}</p>}
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

export default LeaveRequestModal;