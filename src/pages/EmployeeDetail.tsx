import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../store/authStore';
import { useEmployeeStore } from '../store/employeeStore';
import { useProjectStore } from '../store/projectStore';
import {
  User, Mail, Phone, MapPin, Shield, DollarSign, Plus, Edit, Trash2, ChevronDown,
  Award, Star, Calendar, Clock, FileText, Heart, Briefcase, Brain, TrendingUp
} from 'lucide-react';
import EmployeeModal from '../components/EmployeeModal';
import LeaveRequestModal from '../components/LeaveRequestModal';
import ConfirmModal from '../components/ConfirmModal';
import { formatCurrency, formatDate } from '../utils/format';
import type { Employee, Skill, Certification, SalaryHistoryEntry, BonusHistoryEntry, PerformanceReview, LeaveRequest, ProjectAllocation, EmergencyContact, LeaveType, SalaryChangeType, BonusType, SkillLevel } from '../types';

function EmployeeDetail() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const { employees, getEmployeeById, updateEmployee, terminateEmployee, addSkill, updateSkill, removeSkill, addCertification, updateCertification, removeCertification, addSalaryHistory, addBonusHistory, addPerformanceReview, addLeaveRequest, updateLeaveRequest, addProjectAllocation, removeProjectAllocation, getTotalAllocation } = useEmployeeStore();
  const { projects } = useProjectStore();

  const canManage = hasRole(['hr', 'ceo']);
  const employee = getEmployeeById(id || '');
  const [activeTab, setActiveTab] = useState<'contact' | 'payReviews' | 'skills' | 'leave'>('contact');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTerminateConfirm, setShowTerminateConfirm] = useState(false);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [showAddCertification, setShowAddCertification] = useState(false);
  const [editingCertification, setEditingCertification] = useState<Certification | null>(null);
  const [showSalaryAdjustment, setShowSalaryAdjustment] = useState(false);
  const [showAddBonus, setShowAddBonus] = useState(false);
  const [showAddReview, setShowAddReview] = useState(false);
  const [showLeaveRequest, setShowLeaveRequest] = useState(false);
  const [showAddAllocation, setShowAddAllocation] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState<ProjectAllocation | null>(null);
  const [allocationWarning, setAllocationWarning] = useState(false);

  const tabs = [
    { id: 'contact', label: t('employees.contactTab'), icon: User },
    { id: 'payReviews', label: t('employees.payReviewsTab'), icon: DollarSign },
    { id: 'skills', label: t('employees.skillsTab'), icon: Brain },
    { id: 'leave', label: t('employees.leaveTab'), icon: Calendar },
  ];

  if (!employee) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-primary-text-muted">{t('common.noData')}</p>
          <button onClick={() => navigate('/employees')} className="btn btn-primary mt-4">{t('common.back')}</button>
        </div>
      </div>
    );
  }

  const totalAllocation = getTotalAllocation(employee.id);

  const handleUpdateEmployee = (data: Partial<Employee>) => {
    if (totalAllocation > 100 && data.projectAllocations) {
      setAllocationWarning(true);
      return;
    }
    updateEmployee(employee.id, data);
    setShowEditModal(false);
  };

  const handleTerminate = () => {
    terminateEmployee(employee.id);
    setShowTerminateConfirm(false);
    navigate('/employees');
  };

  const handleAddSkill = (skill: Omit<Skill, 'id'>) => {
    addSkill(employee.id, { ...skill, id: `skill-${Date.now()}` });
    setShowAddSkill(false);
    setEditingSkill(null);
  };

  const handleUpdateSkill = (skill: Skill) => {
    updateSkill(employee.id, skill.id, skill);
    setShowAddSkill(false);
    setEditingSkill(null);
  };

  const handleAddCertification = (cert: Omit<Certification, 'id'>) => {
    addCertification(employee.id, { ...cert, id: `cert-${Date.now()}` });
    setShowAddCertification(false);
    setEditingCertification(null);
  };

  const handleUpdateCertification = (cert: Certification) => {
    updateCertification(employee.id, cert.id, cert);
    setShowAddCertification(false);
    setEditingCertification(null);
  };

  const handleAddAllocation = (allocation: Omit<ProjectAllocation, 'projectName'>) => {
    const project = projects.find(p => p.id === allocation.projectId);
    addProjectAllocation(employee.id, { ...allocation, projectName: project?.name || '' });
    setShowAddAllocation(false);
    setEditingAllocation(null);
  };

  const handleUpdateAllocation = (allocation: ProjectAllocation) => {
    const project = projects.find(p => p.id === allocation.projectId);
    addProjectAllocation(employee.id, { ...allocation, projectName: project?.name || '' });
    setShowAddAllocation(false);
    setEditingAllocation(null);
  };

  const handleAddLeaveRequest = (data: Omit<LeaveRequest, 'id' | 'employeeId' | 'status' | 'approvalStatus' | 'requestedAt'>) => {
    addLeaveRequest(employee.id, {
      ...data,
      id: `lr-${Date.now()}`,
      employeeId: employee.id,
      status: 'pending',
      approvalStatus: 'pending_ceo',
      requestedAt: new Date().toISOString().split('T')[0],
    });
    setShowLeaveRequest(false);
  };

  const handleUpdateLeaveRequest = (data: Omit<LeaveRequest, 'id' | 'employeeId' | 'status' | 'approvalStatus' | 'requestedAt'>) => {
    // For editing existing leave request - would need the leave ID
    // For now, just close the modal
    setShowLeaveRequest(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/employees')} className="p-2 text-primary-text-muted hover:text-primary-text hover:bg-primary-hover rounded-lg transition-colors lg:hidden">
            <svg size={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <div className="w-16 h-16 rounded-xl bg-primary-accent/10 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-accent">{employee.firstName.charAt(0)}{employee.lastName.charAt(0)}</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary-text">{employee.firstName} {employee.lastName}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-primary-text-muted">
              <span className="font-mono">{employee.code}</span>
              <span className={`badge ${getStatusBadgeClass(employee.status)}`}>{t(`employees.${employee.status}`)}</span>
              <span className="badge badge-info">{t(`departments.${employee.department}`)}</span>
              <span className="badge badge-gray">{t(`contractTypes.${employee.contractType}`)}</span>
            </div>
          </div>
        </div>
        {canManage && (
          <div className="flex items-center gap-2">
            <button onClick={() => setShowEditModal(true)} className="btn btn-secondary flex items-center gap-2">
              <Edit size={16} /> {t('common.edit')}
            </button>
            {employee.status !== 'terminated' && (
              <button onClick={() => setShowTerminateConfirm(true)} className="btn btn-danger flex items-center gap-2">
                <Trash2 size={16} /> {t('employees.terminateEmployee')}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-primary-border">
          <nav className="flex overflow-x-auto" role="tablist">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-primary-accent border-b-2 border-primary-accent'
                      : 'text-primary-text-muted hover:text-primary-text'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'contact' && <ContactTab employee={employee} t={t} />}
          {activeTab === 'payReviews' && <PayReviewsTab employee={employee} t={t} canManage={canManage} onAddSalary={setShowSalaryAdjustment} onAddBonus={setShowAddBonus} onAddReview={setShowAddReview} />}
          {activeTab === 'skills' && <SkillsTab employee={employee} t={t} canManage={canManage} onAddSkill={setShowAddSkill} onEditSkill={setEditingSkill} onAddCert={setShowAddCertification} onEditCert={setEditingCertification} />}
          {activeTab === 'leave' && <LeaveTab employee={employee} t={t} canManage={canManage} onAddLeave={setShowLeaveRequest} onAddAllocation={setShowAddAllocation} onEditAllocation={setEditingAllocation} />}
        </div>
      </div>

      {showEditModal && (
        <EmployeeModal
          employee={employee}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleUpdateEmployee}
          title={t('employees.editEmployeeTitle')}
        />
      )}

      {showTerminateConfirm && (
        <ConfirmModal
          title={t('employees.terminateConfirmTitle')}
          message={t('employees.terminateConfirmMessage')}
          onConfirm={handleTerminate}
          onCancel={() => setShowTerminateConfirm(false)}
          confirmText={t('employees.terminateSecondConfirm')}
          confirmClass="btn-danger"
          requireDoubleConfirm
        />
      )}

      {allocationWarning && (
        <ConfirmModal
          title={t('employees.allocationExceedsWarning')}
          message={t('employees.allocationExceedsConfirm')}
          onConfirm={() => { updateEmployee(employee.id, {}); setAllocationWarning(false); }}
          onCancel={() => setAllocationWarning(false)}
          confirmText={t('employees.allocationExceedsConfirm')}
          confirmClass="btn-warning"
        />
      )}

      {showAddSkill && <SkillModal employeeId={employee.id} onClose={() => setShowAddSkill(false)} onSubmit={handleAddSkill} skill={editingSkill || undefined} t={t} />}
      {editingSkill && <SkillModal employeeId={employee.id} onClose={() => setEditingSkill(null)} onSubmit={handleUpdateSkill} skill={editingSkill} t={t} />}

      {showAddCertification && <CertificationModal employeeId={employee.id} onClose={() => setShowAddCertification(false)} onSubmit={handleAddCertification} cert={editingCertification || undefined} t={t} />}
      {editingCertification && <CertificationModal employeeId={employee.id} onClose={() => setEditingCertification(null)} onSubmit={handleUpdateCertification} cert={editingCertification} t={t} />}

      {showAddAllocation && <AllocationModal employeeId={employee.id} projects={projects} onClose={() => setShowAddAllocation(false)} onSubmit={handleAddAllocation} allocation={editingAllocation || undefined} t={t} />}
      {editingAllocation && <AllocationModal employeeId={employee.id} projects={projects} onClose={() => setEditingAllocation(null)} onSubmit={handleUpdateAllocation} allocation={editingAllocation} t={t} />}
      {showLeaveRequest && <LeaveRequestModal employeeId={employee.id} employeeName={`${employee.firstName} ${employee.lastName}`} onClose={() => setShowLeaveRequest(false)} onSubmit={handleAddLeaveRequest} t={t} />}
    </div>
  );
}

function ContactTab({ employee, t }: { employee: Employee; t: (key: string) => string }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h3 className="font-semibold text-primary-text">{t('common.contact')}</h3>
        <div className="space-y-3">
          <InfoRow icon={Mail} label={t('common.email')} value={employee.email} />
          <InfoRow icon={Phone} label={t('common.phone')} value={employee.phone} />
          <InfoRow icon={Shield} label={t('employees.nationalId')} value={employee.nationalId} />
          <InfoRow icon={MapPin} label={t('common.address')} value={employee.address} />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-primary-text">{t('common.emergencyContact')}</h3>
        <div className="space-y-3">
          <InfoRow icon={User} label={t('employees.name')} value={employee.emergencyContact.name} />
          <InfoRow icon={Heart} label={t('employees.relationship')} value={employee.emergencyContact.relationship} />
          <InfoRow icon={Phone} label={t('common.phone')} value={employee.emergencyContact.phone} />
          <InfoRow icon={Mail} label={t('common.email')} value={employee.emergencyContact.email || '-'} />
        </div>
      </div>

      <div className="space-y-4 md:col-span-2">
        <h3 className="font-semibold text-primary-text">{t('employees.position')}</h3>
        <p className="text-primary-text-muted">{employee.position}</p>
      </div>

      <div className="space-y-4 md:col-span-2">
        <h3 className="font-semibold text-primary-text">{t('employees.hireDate')}</h3>
        <p className="text-primary-text-muted">{formatDate(employee.hireDate)} ({t('employees.yearsOfService')}: {calculateYearsOfService(employee.hireDate)})</p>
      </div>

      <div className="space-y-4 md:col-span-2">
        <h3 className="font-semibold text-primary-text">{t('employees.manager')}</h3>
        <p className="text-primary-text-muted">{employee.managerId ? t('employees.managerAssigned') : t('common.none')}</p>
      </div>
    </div>
  );
}

function PayReviewsTab({ employee, t, canManage, onAddSalary, onAddBonus, onAddReview }: { employee: Employee; t: (key: string) => string; canManage: boolean; onAddSalary: () => void; onAddBonus: () => void; onAddReview: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-primary-text">{t('employees.salaryHistory')}</h3>
        {canManage && (
          <button onClick={onAddSalary} className="btn btn-primary text-sm flex items-center gap-1">
            <Plus size={14} /> {t('employees.adjustSalary')}
          </button>
        )}
      </div>
      <div className="space-y-3">
        {employee.salaryHistory.length > 0 ? (
          employee.salaryHistory.map(entry => (
            <SalaryHistoryRow key={entry.id} entry={entry} t={t} />
          ))
        ) : (
          <div className="text-center py-8 text-primary-text-muted">{t('common.noData')}</div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-primary-text">{t('employees.bonusHistory')}</h3>
        {canManage && (
          <button onClick={onAddBonus} className="btn btn-primary text-sm flex items-center gap-1">
            <Plus size={14} /> {t('employees.addBonus')}
          </button>
        )}
      </div>
      <div className="space-y-3">
        {employee.bonusHistory.length > 0 ? (
          employee.bonusHistory.map(entry => (
            <BonusHistoryRow key={entry.id} entry={entry} t={t} />
          ))
        ) : (
          <div className="text-center py-8 text-primary-text-muted">{t('common.noData')}</div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-primary-text">{t('employees.performanceReviews')}</h3>
        {canManage && (
          <button onClick={onAddReview} className="btn btn-primary text-sm flex items-center gap-1">
            <Plus size={14} /> {t('employees.addReview')}
          </button>
        )}
      </div>
      <div className="space-y-3">
        {employee.performanceReviews.length > 0 ? (
          employee.performanceReviews.map(review => (
            <PerformanceReviewRow key={review.id} review={review} t={t} />
          ))
        ) : (
          <div className="text-center py-8 text-primary-text-muted">{t('common.noData')}</div>
        )}
      </div>
    </div>
  );
}

function SkillsTab({ employee, t, canManage, onAddSkill, onEditSkill, onAddCert, onEditCert }: { employee: Employee; t: (key: string) => string; canManage: boolean; onAddSkill: () => void; onEditSkill: (skill: Skill) => void; onAddCert: () => void; onEditCert: (cert: Certification) => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-primary-text">{t('employees.skills')}</h3>
        {canManage && (
          <button onClick={onAddSkill} className="btn btn-primary text-sm flex items-center gap-1">
            <Plus size={14} /> {t('employees.addSkill')}
          </button>
        )}
      </div>
      <div className="space-y-3">
        {employee.skills.length > 0 ? (
          employee.skills.map(skill => (
            <SkillRow key={skill.id} skill={skill} t={t} canManage={canManage} onEdit={onEditSkill} onDelete={() => {}} />
          ))
        ) : (
          <div className="text-center py-8 text-primary-text-muted">{t('common.noData')}</div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-primary-text">{t('employees.certifications')}</h3>
        {canManage && (
          <button onClick={onAddCert} className="btn btn-primary text-sm flex items-center gap-1">
            <Plus size={14} /> {t('employees.addCertification')}
          </button>
        )}
      </div>
      <div className="space-y-3">
        {employee.certifications.length > 0 ? (
          employee.certifications.map(cert => (
            <CertificationRow key={cert.id} cert={cert} t={t} canManage={canManage} onEdit={onEditCert} onDelete={() => {}} />
          ))
        ) : (
          <div className="text-center py-8 text-primary-text-muted">{t('common.noData')}</div>
        )}
      </div>
    </div>
  );
}

function LeaveTab({ employee, t, canManage, onAddLeave, onAddAllocation, onEditAllocation }: { employee: Employee; t: (key: string) => string; canManage: boolean; onAddLeave: () => void; onAddAllocation: () => void; onEditAllocation: (alloc: ProjectAllocation) => void }) {
  const annualRemaining = employee.annualLeaveBalance + employee.annualLeaveCarriedOver - (employee.annualLeaveUsed || 0);
  const sickRemaining = employee.sickLeaveBalance - (employee.sickLeaveUsed || 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <LeaveBalanceCard
          title={t('employees.annualLeave')}
          total={employee.annualLeaveBalance + employee.annualLeaveCarriedOver}
          used={employee.annualLeaveUsed || 0}
          remaining={annualRemaining}
          accrued={employee.annualLeaveAccrued}
          carriedOver={employee.annualLeaveCarriedOver}
          expires={t('leaveApprovals.carryOverExpires')}
          icon={Calendar}
        />
        <LeaveBalanceCard
          title={t('employees.sickLeave')}
          total={employee.sickLeaveBalance}
          used={employee.sickLeaveUsed || 0}
          remaining={sickRemaining}
          icon={Clock}
        />
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-primary-text">{t('employees.leaveRequests')}</h3>
        {canManage && (
          <button onClick={onAddLeave} className="btn btn-primary text-sm flex items-center gap-1">
            <Plus size={14} /> {t('employees.requestLeave')}
          </button>
        )}
      </div>
      <div className="space-y-3">
        {employee.leaveRequests.length > 0 ? (
          employee.leaveRequests.map(req => (
            <LeaveRequestRow key={req.id} request={req} t={t} />
          ))
        ) : (
          <div className="text-center py-8 text-primary-text-muted">{t('common.noData')}</div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-primary-text">{t('employees.projects')}</h3>
        {canManage && (
          <button onClick={onAddAllocation} className="btn btn-primary text-sm flex items-center gap-1">
            <Plus size={14} /> {t('employees.addToProject')}
          </button>
        )}
      </div>
      <div className="space-y-3">
        {employee.projectAllocations.length > 0 ? (
          employee.projectAllocations.map(alloc => (
            <AllocationRow key={alloc.projectId} allocation={alloc} t={t} canManage={canManage} onEdit={onEditAllocation} onRemove={() => {}} />
          ))
        ) : (
          <div className="text-center py-8 text-primary-text-muted">{t('common.noData')}</div>
        )}
      </div>

      {canManage && (
        <div className="p-4 bg-primary-warning/10 border border-primary-warning/20 rounded-lg">
          <p className="text-sm text-primary-warning flex items-center gap-2">
            <span>⚠</span>
            {t('employees.allocationExceedsWarning').replace('Please confirm to proceed.', '')} {getTotalAllocation(employee.id)}%
          </p>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ size?: number }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-primary-bg/50 rounded-lg">
      <Icon size={18} className="text-primary-text-muted" />
      <div>
        <p className="text-xs text-primary-text-muted">{label}</p>
        <p className="text-primary-text">{value || '-'}</p>
      </div>
    </div>
  );
}

function SalaryHistoryRow({ entry, t }: { entry: SalaryHistoryEntry; t: (key: string) => string }) {
  return (
    <div className="p-4 bg-primary-bg/50 rounded-lg border border-primary-border/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`badge ${entry.changeType === 'increase' || entry.changeType === 'promotion' ? 'badge-success' : entry.changeType === 'decrease' ? 'badge-danger' : 'badge-info'}`}>
            {t(`salaryChangeTypes.${entry.changeType}`)}
          </span>
          <div>
            <p className="font-medium text-primary-text">{formatCurrency(entry.previousSalary)} → {formatCurrency(entry.newSalary)}</p>
            <p className="text-sm text-primary-text-muted">{formatDate(entry.effectiveDate)}</p>
          </div>
        </div>
        <div className="text-right text-sm text-primary-text-muted">
          <p>{t('employees.approvedBy')}: {entry.approvedBy}</p>
          <p>{entry.reason}</p>
        </div>
      </div>
    </div>
  );
}

function BonusHistoryRow({ entry, t }: { entry: BonusHistoryEntry; t: (key: string) => string }) {
  return (
    <div className="p-4 bg-primary-bg/50 rounded-lg border border-primary-border/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="badge badge-info">{t(`bonusTypes.${entry.type}`)}</span>
          <div>
            <p className="font-medium text-primary-text">{formatCurrency(entry.amount)}</p>
            <p className="text-sm text-primary-text-muted">{formatDate(entry.date)}</p>
          </div>
        </div>
        <div className="text-right text-sm text-primary-text-muted">
          <p>{t('employees.approvedBy')}: {entry.approvedBy}</p>
          <p>{entry.description}</p>
        </div>
      </div>
    </div>
  );
}

function PerformanceReviewRow({ review, t }: { review: PerformanceReview; t: (key: string) => string }) {
  return (
    <div className="p-4 bg-primary-bg/50 rounded-lg border border-primary-border/50">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-medium text-primary-text">{review.reviewPeriod}</span>
            <div className="flex items-center gap-1">
              <Star size={16} className="text-primary-warning fill-current" />
              <span className="font-bold">{review.rating}/5</span>
            </div>
            <span className="text-sm text-primary-text-muted">{formatDate(review.date)}</span>
          </div>
          <p className="text-sm text-primary-text-muted">{review.reviewerName}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-primary-border/50">
        <div>
          <p className="text-xs text-primary-text-muted">{t('employees.strengths')}</p>
          <p className="text-sm text-primary-text">{review.strengths}</p>
        </div>
        <div>
          <p className="text-xs text-primary-text-muted">{t('employees.improvements')}</p>
          <p className="text-sm text-primary-text">{review.improvements}</p>
        </div>
        <div>
          <p className="text-xs text-primary-text-muted">{t('employees.goals')}</p>
          <p className="text-sm text-primary-text">{review.goals}</p>
        </div>
      </div>
    </div>
  );
}

function SkillRow({ skill, t, canManage, onEdit, onDelete }: { skill: Skill; t: (key: string) => string; canManage: boolean; onEdit: (skill: Skill) => void; onDelete: () => void }) {
  return (
    <div className="p-4 bg-primary-bg/50 rounded-lg border border-primary-border/50 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-primary-accent/10 flex items-center justify-center">
          <Brain size={18} className="text-primary-accent" />
        </div>
        <div>
          <p className="font-medium text-primary-text">{skill.name}</p>
          <p className="text-sm text-primary-text-muted">{t(`skillLevels.${skill.level}`)} • {skill.yearsExperience} {t('common.years')} • {skill.category}</p>
        </div>
      </div>
      {canManage && (
        <button onClick={() => onEdit(skill)} className="p-2 text-primary-text-muted hover:text-primary-text hover:bg-primary-hover rounded-lg transition-colors">
          <Edit size={16} />
        </button>
      )}
    </div>
  );
}

function CertificationRow({ cert, t, canManage, onEdit, onDelete }: { cert: Certification; t: (key: string) => string; canManage: boolean; onEdit: (cert: Certification) => void; onDelete: () => void }) {
  return (
    <div className="p-4 bg-primary-bg/50 rounded-lg border border-primary-border/50 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-primary-warning/10 flex items-center justify-center">
          <Award size={18} className="text-primary-warning" />
        </div>
        <div>
          <p className="font-medium text-primary-text">{cert.name}</p>
          <p className="text-sm text-primary-text-muted">{cert.issuer} • {formatDate(cert.issuedDate)} {cert.expiryDate ? `→ ${formatDate(cert.expiryDate)}` : ''}</p>
        </div>
      </div>
      {canManage && (
        <button onClick={() => onEdit(cert)} className="p-2 text-primary-text-muted hover:text-primary-text hover:bg-primary-hover rounded-lg transition-colors">
          <Edit size={16} />
        </button>
      )}
    </div>
  );
}

function LeaveRequestRow({ request, t }: { request: LeaveRequest; t: (key: string) => string }) {
  return (
    <div className="p-4 bg-primary-bg/50 rounded-lg border border-primary-border/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`badge ${getLeaveStatusBadgeClass(request.status)}`}>
            {t(`employees.${request.status}`)}
          </span>
          <div>
            <p className="font-medium text-primary-text">{t(`leaveTypes.${request.type}`)}</p>
            <p className="text-sm text-primary-text-muted">{formatDateRange(request.startDate, request.endDate)} • {request.totalDays} {t('common.days')}</p>
          </div>
        </div>
        <div className="text-right text-sm text-primary-text-muted">
          <p>{request.reason}</p>
          {request.approvalStatus && (
            <p>{t(`approvalStatuses.${request.approvalStatus}`)}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function AllocationRow({ allocation, t, canManage, onEdit, onRemove }: { allocation: ProjectAllocation; t: (key: string) => string; canManage: boolean; onEdit: (alloc: ProjectAllocation) => void; onRemove: () => void }) {
  return (
    <div className="p-4 bg-primary-bg/50 rounded-lg border border-primary-border/50 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-primary-info/10 flex items-center justify-center">
          <Briefcase size={18} className="text-primary-info" />
        </div>
        <div>
          <p className="font-medium text-primary-text">{allocation.projectName}</p>
          <p className="text-sm text-primary-text-muted">{t(`projects.projectRole.${allocation.role}`)} • {allocation.allocationPercent}% • {formatDate(allocation.startDate)} {allocation.endDate ? `→ ${formatDate(allocation.endDate)}` : ''}</p>
        </div>
      </div>
      {canManage && (
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(allocation)} className="p-2 text-primary-text-muted hover:text-primary-text hover:bg-primary-hover rounded-lg transition-colors">
            <Edit size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

function LeaveBalanceCard({ title, total, used, remaining, accrued, carriedOver, expires, icon: Icon }: { title: string; total: number; used: number; remaining: number; accrued?: number; carriedOver?: number; expires?: string; icon: React.ComponentType<{ size?: number }> }) {
  const percentage = total > 0 ? (used / total) * 100 : 0;
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-accent/10 flex items-center justify-center">
            <Icon size={20} className="text-primary-accent" />
          </div>
          <h3 className="font-semibold text-primary-text">{title}</h3>
        </div>
        <span className="text-2xl font-bold text-primary-text">{remaining}</span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-primary-text-muted">{t('common.total')}</span>
          <span className="text-primary-text">{total}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-primary-text-muted">{t('employees.used')}</span>
          <span className="text-primary-text">{used}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-primary-text-muted">{t('employees.remaining')}</span>
          <span className="font-medium text-primary-success">{remaining}</span>
        </div>
        {accrued !== undefined && (
          <div className="flex justify-between text-sm">
            <span className="text-primary-text-muted">{t('employees.accruedMonthly')}</span>
            <span className="text-primary-text">{accrued}/month</span>
          </div>
        )}
        {carriedOver !== undefined && carriedOver > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-primary-text-muted">{t('employees.carriedOver')}</span>
            <span className="text-primary-text">{carriedOver}</span>
          </div>
        )}
        {expires && (
          <p className="text-xs text-primary-text-muted">{expires}</p>
        )}
      </div>
      <div className="progress-bar mt-4">
        <div className="progress-fill" style={{ width: `${Math.min(percentage, 100)}%` }}></div>
      </div>
    </div>
  );
}

function SkillModal({ employeeId, onClose, onSubmit, skill, t }: { employeeId: string; onClose: () => void; onSubmit: (skill: any) => void; skill?: Skill; t: (key: string) => string }) {
  const [formData, setFormData] = useState({ name: '', category: '', level: 'beginner' as SkillLevel, yearsExperience: 0 });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (skill) setFormData({ name: skill.name, category: skill.category, level: skill.level, yearsExperience: skill.yearsExperience });
  }, [skill]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = t('validation.required');
    if (!formData.category) newErrors.category = t('validation.required');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal max-w-md" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-xl font-semibold text-primary-text">{skill ? t('employees.editSkillTitle') : t('employees.addSkillTitle')}</h2>
          <button onClick={onClose} className="p-2 text-primary-text-muted hover:text-primary-text hover:bg-primary-hover rounded-lg"><X size={20} /></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); if (validate()) onSubmit(formData); }} className="p-6 space-y-4">
          <div>
            <label className="form-label">{t('employees.skillName')}</label>
            <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="input" placeholder={t('employees.skillName')} />
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>
          <div>
            <label className="form-label">{t('employees.skillCategory')}</label>
            <input value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="input" placeholder={t('employees.skillCategory')} />
            {errors.category && <p className="form-error">{errors.category}</p>}
          </div>
          <div>
            <label className="form-label">{t('employees.skillLevel')}</label>
            <select value={formData.level} onChange={e => setFormData({ ...formData, level: e.target.value as SkillLevel })} className="input">
              {['beginner', 'intermediate', 'advanced', 'expert'].map(l => <option key={l} value={l}>{t(`skillLevels.${l}`)}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">{t('employees.yearsExperience')}</label>
            <input type="number" value={formData.yearsExperience} onChange={e => setFormData({ ...formData, yearsExperience: parseInt(e.target.value) || 0 })} className="input" min="0" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-primary-border">
            <button type="button" onClick={onClose} className="btn btn-secondary">{t('common.cancel')}</button>
            <button type="submit" className="btn btn-primary">{t('common.save')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CertificationModal({ employeeId, onClose, onSubmit, cert, t }: { employeeId: string; onClose: () => void; onSubmit: (cert: any) => void; cert?: Certification; t: (key: string) => string }) {
  const [formData, setFormData] = useState({ name: '', issuer: '', issuedDate: '', expiryDate: '', credentialId: '', credentialUrl: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (cert) setFormData({ name: cert.name, issuer: cert.issuer, issuedDate: cert.issuedDate, expiryDate: cert.expiryDate || '', credentialId: cert.credentialId || '', credentialUrl: cert.credentialUrl || '' });
  }, [cert]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal max-w-md" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-xl font-semibold text-primary-text">{cert ? t('employees.editCertificationTitle') : t('employees.addCertificationTitle')}</h2>
          <button onClick={onClose} className="p-2 text-primary-text-muted hover:text-primary-text hover:bg-primary-hover rounded-lg"><X size={20} /></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSubmit(formData); }} className="p-6 space-y-4">
          <div>
            <label className="form-label">{t('employees.certificationName')}</label>
            <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="input" placeholder={t('employees.certificationName')} required />
          </div>
          <div>
            <label className="form-label">{t('employees.certificationIssuer')}</label>
            <input value={formData.issuer} onChange={e => setFormData({ ...formData, issuer: e.target.value })} className="input" placeholder={t('employees.certificationIssuer')} required />
          </div>
          <div>
            <label className="form-label">{t('employees.issuedDate')}</label>
            <input type="date" value={formData.issuedDate} onChange={e => setFormData({ ...formData, issuedDate: e.target.value })} className="input" required />
          </div>
          <div>
            <label className="form-label">{t('employees.expiryDate')}</label>
            <input type="date" value={formData.expiryDate} onChange={e => setFormData({ ...formData, expiryDate: e.target.value })} className="input" />
          </div>
          <div>
            <label className="form-label">{t('employees.credentialId')}</label>
            <input value={formData.credentialId} onChange={e => setFormData({ ...formData, credentialId: e.target.value })} className="input" placeholder={t('employees.credentialId')} />
          </div>
          <div>
            <label className="form-label">{t('employees.credentialUrl')}</label>
            <input value={formData.credentialUrl} onChange={e => setFormData({ ...formData, credentialUrl: e.target.value })} className="input" placeholder={t('employees.credentialUrl')} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-primary-border">
            <button type="button" onClick={onClose} className="btn btn-secondary">{t('common.cancel')}</button>
            <button type="submit" className="btn btn-primary">{t('common.save')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AllocationModal({ employeeId, projects, onClose, onSubmit, allocation, t }: { employeeId: string; projects: any[]; onClose: () => void; onSubmit: (alloc: any) => void; allocation?: ProjectAllocation; t: (key: string) => string }) {
  const [formData, setFormData] = useState({ projectId: '', role: 'mid' as any, allocationPercent: 0, startDate: '', endDate: '' });

  useEffect(() => {
    if (allocation) setFormData({ projectId: allocation.projectId, role: allocation.role, allocationPercent: allocation.allocationPercent, startDate: allocation.startDate, endDate: allocation.endDate || '' });
    else setFormData({ ...formData, startDate: new Date().toISOString().split('T')[0] });
  }, [allocation]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal max-w-md" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-xl font-semibold text-primary-text">{allocation ? t('employees.editAllocation') : t('employees.addAllocation')}</h2>
          <button onClick={onClose} className="p-2 text-primary-text-muted hover:text-primary-text hover:bg-primary-hover rounded-lg"><X size={20} /></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSubmit(formData); }} className="p-6 space-y-4">
          <div>
            <label className="form-label">{t('employees.selectEmployee')}</label>
            <select value={formData.projectId} onChange={e => setFormData({ ...formData, projectId: e.target.value })} className="input" required>
              <option value="">{t('employees.selectEmployee')}</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.code} - {p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">{t('employees.projectRole')}</label>
            <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value as any })} className="input">
              {['lead', 'senior', 'mid', 'junior', 'intern', 'consultant'].map(r => <option key={r} value={r}>{t(`projects.${r}`)}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">{t('employees.allocationPercent')}</label>
            <input type="number" value={formData.allocationPercent} onChange={e => setFormData({ ...formData, allocationPercent: parseInt(e.target.value) || 0 })} className="input" min="0" max="100" required />
          </div>
          <div>
            <label className="form-label">{t('employees.allocationStartDate')}</label>
            <input type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} className="input" required />
          </div>
          <div>
            <label className="form-label">{t('employees.allocationEndDate')}</label>
            <input type="date" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} className="input" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-primary-border">
            <button type="button" onClick={onClose} className="btn btn-secondary">{t('common.cancel')}</button>
            <button type="submit" className="btn btn-primary">{t('common.save')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function calculateYearsOfService(hireDate: string): number {
  const hire = new Date(hireDate);
  const now = new Date();
  return now.getFullYear() - hire.getFullYear();
}

function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return `${startDate.toLocaleDateString('th-TH', { day: '2-digit', month: 'short' })} - ${endDate.toLocaleDateString('th-TH', { day: '2-digit', month: 'short' })}`;
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'working': return 'badge-success';
    case 'on_leave': return 'badge-info';
    case 'sick_leave': return 'badge-warning';
    case 'terminated': return 'badge-danger';
    default: return 'badge-gray';
  }
}

function getLeaveStatusBadgeClass(status: string): string {
  switch (status) {
    case 'pending': return 'badge-warning';
    case 'approved': return 'badge-success';
    case 'rejected': return 'badge-danger';
    case 'cancelled': return 'badge-gray';
    default: return 'badge-gray';
  }
}

export default EmployeeDetail;