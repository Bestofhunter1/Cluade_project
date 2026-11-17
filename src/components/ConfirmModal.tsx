import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';

interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmClass?: 'btn-primary' | 'btn-danger' | 'btn-warning';
  requireDoubleConfirm?: boolean;
  showIcon?: boolean;
}

function ConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
  confirmClass = 'btn-danger',
  requireDoubleConfirm = false,
  showIcon = true,
}: ConfirmModalProps) {
  const { t } = useTranslation();
  const [doubleConfirmed, setDoubleConfirmed] = useState(false);

  const handleConfirm = () => {
    if (requireDoubleConfirm && !doubleConfirmed) {
      setDoubleConfirmed(true);
      return;
    }
    onConfirm();
    setDoubleConfirmed(false);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal max-w-md" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-xl font-semibold text-primary-text flex items-center gap-2">
            {showIcon && <AlertTriangle size={20} className="text-primary-warning" />}
            {title}
          </h2>
          <button onClick={onCancel} className="p-2 text-primary-text-muted hover:text-primary-text hover:bg-primary-hover rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-primary-text mb-6">{message}</p>

          {requireDoubleConfirm && doubleConfirmed && (
            <div className="mb-4 p-3 bg-primary-warning/10 border border-primary-warning/20 rounded-lg flex items-center gap-2 text-primary-warning">
              <CheckCircle size={18} />
              <span className="text-sm">{t('employees.terminateSecondConfirm')}</span>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button onClick={onCancel} className="btn btn-secondary">
              {cancelText || t('common.cancel')}
            </button>
            <button
              onClick={handleConfirm}
              className={`btn ${confirmClass} ${requireDoubleConfirm && !doubleConfirmed ? 'opacity-70' : ''}`}
            >
              {requireDoubleConfirm && !doubleConfirmed ? confirmText || t('common.confirm') : t('common.confirm')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;