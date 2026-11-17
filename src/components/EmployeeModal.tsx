import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Calendar, User, Mail, Phone, MapPin, Building2, DollarSign, Briefcase } from 'lucide-react';
import type { Employee, Department, ContractType } from '../types';

interface EmployeeModalProps {
  employee?: Employee | null;
  onClose: () => void;
  onSubmit: (data: Partial<Employee>) => void;
  title: string;
}

const departments: Department[] = [
  'engineering', 'design', 'product', 'data', 'devops', 'qa',
  'management', 'hr', 'finance', 'marketing', 'sales', 'operations',
  'robotics', 'inventory', 'fulfillment', 'warehouse_ops'
];

const contractTypes: ContractType[] = ['full_time', 'part_time', 'contract', 'probation'];

function EmployeeModal({ employee, onClose, onSubmit, title }: EmployeeModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Partial<Employee>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationalId: '',
    address: '',
    department: 'engineering',
    position: '',
    contractType: 'full_time',
    salary: 0,
    hireDate: new Date().toISOString().split('T')[0],
    code: employee?.code || `EMP-${String(Date.now()).slice(-6)}`,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (employee) {
      setFormData({
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        nationalId: employee.nationalId,
        address: employee.address,
        department: employee.department,
        position: employee.position,
        contractType: employee.contractType,
        salary: employee.salary,
        hireDate: employee.hireDate,
        code: employee.code,
      });
    }
  }, [employee]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName) newErrors.firstName = t('validation.required');
    if (!formData.lastName) newErrors.lastName = t('validation.required');
    if (!formData.email) newErrors.email = t('validation.required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = t('validation.email');
    if (!formData.phone) newErrors.phone = t('validation.required');
    if (!formData.nationalId) newErrors.nationalId = t('validation.required');
    else if (!/^\d{13}$/.test(formData.nationalId)) newErrors.nationalId = t('validation.nationalId');
    if (!formData.position) newErrors.position = t('validation.required');
    if (!formData.salary || formData.salary <= 0) newErrors.salary = t('validation.positiveNumber');
    if (!formData.hireDate) newErrors.hireDate = t('validation.required');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const employeeData: Partial<Employee> = {
        ...formData,
        id: employee?.id || `emp-${Date.now()}`,
        createdAt: employee?.createdAt || new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        status: employee?.status || 'working',
        annualLeaveBalance: employee?.annualLeaveBalance ?? 10,
        annualLeaveAccrued: employee?.annualLeaveAccrued ?? 0.83,
        annualLeaveCarriedOver: employee?.annualLeaveCarriedOver ?? 0,
        sickLeaveBalance: employee?.sickLeaveBalance ?? 30,
        sickLeaveUsed: employee?.sickLeaveUsed ?? 0,
        skills: employee?.skills ?? [],
        certifications: employee?.certifications ?? [],
        salaryHistory: employee?.salaryHistory ?? [],
        bonusHistory: employee?.bonusHistory ?? [],
        performanceReviews: employee?.performanceReviews ?? [],
        leaveRequests: employee?.leaveRequests ?? [],
        emergencyContact: employee?.emergencyContact ?? { name: '', relationship: '', phone: '' },
        projectAllocations: employee?.projectAllocations ?? [],
      };
      onSubmit(employeeData);
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
              <label className="form-label">{t('employees.firstName')}</label>
              <div className="relative">
                <User className="input-icon" />
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                  className="input pl-10"
                  placeholder={t('employees.firstName')}
                />
              </div>
              {errors.firstName && <p className="form-error">{errors.firstName}</p>}
            </div>

            <div>
              <label className="form-label">{t('employees.lastName')}</label>
              <div className="relative">
                <User className="input-icon" />
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                  className="input pl-10"
                  placeholder={t('employees.lastName')}
                />
              </div>
              {errors.lastName && <p className="form-error">{errors.lastName}</p>}
            </div>

            <div>
              <label className="form-label">{t('common.email')}</label>
              <div className="relative">
                <Mail className="input-icon" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="input pl-10"
                  placeholder={t('common.email')}
                />
              </div>
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            <div>
              <label className="form-label">{t('common.phone')}</label>
              <div className="relative">
                <Phone className="input-icon" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="input pl-10"
                  placeholder={t('common.phone')}
                />
              </div>
              {errors.phone && <p className="form-error">{errors.phone}</p>}
            </div>

            <div>
              <label className="form-label">{t('employees.nationalId')}</label>
              <div className="relative">
                <User className="input-icon" />
                <input
                  type="text"
                  value={formData.nationalId}
                  onChange={e => setFormData({ ...formData, nationalId: e.target.value })}
                  className="input pl-10"
                  placeholder={t('employees.nationalId')}
                  maxLength={13}
                />
              </div>
              {errors.nationalId && <p className="form-error">{errors.nationalId}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="form-label">{t('common.address')}</label>
              <div className="relative">
                <MapPin className="input-icon" />
                <textarea
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="input pl-10 min-h-[100px] resize-y"
                  placeholder={t('common.address')}
                />
              </div>
            </div>

            <div>
              <label className="form-label">{t('employees.employeeCode')}</label>
              <div className="relative">
                <Building2 className="input-icon" />
                <input
                  type="text"
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  className="input pl-10"
                  placeholder={t('employees.employeeCode')}
                  disabled={!!employee}
                />
              </div>
            </div>

            <div>
              <label className="form-label">{t('employees.hireDate')}</label>
              <div className="relative">
                <Calendar className="input-icon" />
                <input
                  type="date"
                  value={formData.hireDate}
                  onChange={e => setFormData({ ...formData, hireDate: e.target.value })}
                  className="input pl-10"
                />
              </div>
              {errors.hireDate && <p className="form-error">{errors.hireDate}</p>}
            </div>

            <div>
              <label className="form-label">{t('employees.department')}</label>
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
              <label className="form-label">{t('employees.position')}</label>
              <div className="relative">
                <Briefcase className="input-icon" />
                <input
                  type="text"
                  value={formData.position}
                  onChange={e => setFormData({ ...formData, position: e.target.value })}
                  className="input pl-10"
                  placeholder={t('employees.position')}
                />
              </div>
              {errors.position && <p className="form-error">{errors.position}</p>}
            </div>

            <div>
              <label className="form-label">{t('employees.contractType')}</label>
              <select
                value={formData.contractType}
                onChange={e => setFormData({ ...formData, contractType: e.target.value as ContractType })}
                className="input"
              >
                {contractTypes.map(type => (
                  <option key={type} value={type}>{t(`contractTypes.${type}`)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">{t('employees.salary')}</label>
              <div className="relative">
                <DollarSign className="input-icon" />
                <input
                  type="number"
                  value={formData.salary}
                  onChange={e => setFormData({ ...formData, salary: parseFloat(e.target.value) || 0 })}
                  className="input pl-10"
                  placeholder={t('employees.salary')}
                  min="0"
                  step="1000"
                />
              </div>
              {errors.salary && <p className="form-error">{errors.salary}</p>}
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

export default EmployeeModal;