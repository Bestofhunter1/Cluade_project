import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../store/authStore';
import { useEmployeeStore } from '../store/employeeStore';
import { CheckCircle, XCircle, Clock, User, Calendar, FileText, Filter, ChevronDown, Search } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import type { LeaveRequest, LeaveType, LeaveStatus, ApprovalStatus, Employee } from '../types';

function LeaveApprovals() {
  const { t } = useTranslation();
  const { user, hasRole } = useAuth();
  const { employees } = useEmployeeStore();

  const isCEO = user?.role === 'ceo';
  const isHR = user?.role === 'hr';

  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<LeaveType | 'all'>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');

  const [approvingRequest, setApprovingRequest] = useState<LeaveRequest | null>(null);
  const [rejectingRequest, setRejectingRequest] = useState<LeaveRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const allLeaveRequests = useMemo(() => {
    const requests: (LeaveRequest & { employeeName: string; employeeCode: string; department: string })[] = [];
    employees.forEach(emp => {
      emp.leaveRequests.forEach(lr => {
        requests.push({
          ...lr,
          employeeName: `${emp.firstName} ${emp.lastName}`,
          employeeCode: emp.code,
          department: emp.department,
        });
      });
    });
    return requests;
  }, [employees]);

  const filteredRequests = useMemo(() => {
    let result = [...allLeaveRequests];

    if (activeTab !== 'all') {
      const statusMap: Record<string, LeaveStatus> = {
        pending: 'pending',
        approved: 'approved',
        rejected: 'rejected',
      };
      result = result.filter(r => r.status === statusMap[activeTab]);
    }

    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.employeeName.toLowerCase().includes(search) ||
        r.employeeCode.toLowerCase().includes(search) ||
        r.reason.toLowerCase().includes(search)
      );
    }

    if (filterType !== 'all') {
      result = result.filter(r => r.type === filterType);
    }

    if (filterDepartment !== 'all') {
      result = result.filter(r => r.department === filterDepartment);
    }

    result.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
    return result;
  }, [allLeaveRequests, activeTab, searchQuery, filterType, filterDepartment]);

  const pendingCount = allLeaveRequests.filter(r => r.status === 'pending').length;
  const approvedCount = allLeaveRequests.filter(r => r.status === 'approved').length;
  const rejectedCount = allLeaveRequests.filter(r => r.status === 'rejected').length;

  const handleApprove = (request: LeaveRequest) => {
    setApprovingRequest(request);
  };

  const handleConfirmApprove = () => {
    if (approvingRequest) {
      const emp = employees.find(e => e.id === approvingRequest.employeeId);
      if (emp) {
        const { updateLeaveRequest } = useEmployeeStore.getState();
        updateLeaveRequest(emp.id, approvingRequest.id, {
          status: 'approved',
          approvalStatus: 'approved',
          reviewedAt: new Date().toISOString().split('T')[0],
          reviewedBy: user?.id,
          reviewNote: 'Approved by CEO',
        });

        // Update leave balance
        if (approvingRequest.type === 'annual') {
          // Balance will be calculated dynamically
        }
      }
      setApprovingRequest(null);
    }
  };

  const handleReject = (request: LeaveRequest) => {
    setRejectingRequest(request);
    setRejectReason('');
  };

  const handleConfirmReject = () => {
    if (rejectingRequest) {
      const emp = employees.find(e => e.id === rejectingRequest.employeeId);
      if (emp) {
        const { updateLeaveRequest } = useEmployeeStore.getState();
        updateLeaveRequest(emp.id, rejectingRequest.id, {
          status: 'rejected',
          approvalStatus: 'rejected',
          reviewedAt: new Date().toISOString().split('T')[0],
          reviewedBy: user?.id,
          reviewNote: rejectReason,
        });
      }
      setRejectingRequest(null);
      setRejectReason('');
    }
  };

  const departments = [...new Set(employees.map(e => e.department))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-primary-text">{t('leaveApprovals.title')}</h1>
          <p className="text-primary-text-muted mt-1">{t('leaveApprovals.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title={t('leaveApprovals.pendingApprovals')} value={pendingCount} icon={Clock} color="text-primary-warning" bgColor="bg-primary-warning/10" />
        <StatCard title={t('leaveApprovals.approvedRequests')} value={approvedCount} icon={CheckCircle} color="text-primary-success" bgColor="bg-primary-success/10" />
        <StatCard title={t('leaveApprovals.rejectedRequests')} value={rejectedCount} icon={XCircle} color="text-primary-danger" bgColor="bg-primary-danger/10" />
        <StatCard title={t('leaveApprovals.allRequests')} value={allLeaveRequests.length} icon={FileText} color="text-primary-accent" bgColor="bg-primary-accent/10" />
      </div>

      <div className="card p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-text-muted size-5" />
            <input
              type="search"
              placeholder={t('common.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input w-full pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as LeaveType | 'all')}
              className="input w-full sm:w-40"
            >
              <option value="all">{t('leaveApprovals.type')}</option>
              {['annual', 'sick', 'personal', 'maternity', 'paternity', 'bereavement', 'unpaid'].map(type => (
                <option key={type} value={type}>{t(`leaveTypes.${type}`)}</option>
              ))}
            </select>

            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="input w-full sm:w-48"
            >
              <option value="all">{t('leaveApprovals.byDepartment')}</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{t(`departments.${dept}`)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-primary-border">
          <nav className="flex overflow-x-auto" role="tablist">
            {[
              { id: 'pending', label: t('leaveApprovals.pendingApprovals'), count: pendingCount },
              { id: 'approved', label: t('leaveApprovals.approvedRequests'), count: approvedCount },
              { id: 'rejected', label: t('leaveApprovals.rejectedRequests'), count: rejectedCount },
              { id: 'all', label: t('leaveApprovals.allRequests'), count: allLeaveRequests.length },
            ].map(tab => (
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
                {tab.label}
                <span className={`badge ${activeTab === tab.id ? 'badge-primary' : 'badge-gray'}`}>{tab.count}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>{t('leaveApprovals.employee')}</th>
                <th className="hidden md:table-cell">{t('leaveApprovals.type')}</th>
                <th className="hidden lg:table-cell">{t('leaveApprovals.startDate')}</th>
                <th className="hidden lg:table-cell">{t('leaveApprovals.endDate')}</th>
                <th className="hidden lg:table-cell">{t('leaveApprovals.days')}</th>
                <th className="hidden xl:table-cell">{t('leaveApprovals.reason')}</th>
                <th>{t('leaveApprovals.status')}</th>
                <th className="hidden md:table-cell">{t('leaveApprovals.requestedAt')}</th>
                <th className="text-right w-32">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-primary-hover/50">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-accent/10 flex items-center justify-center text-primary-accent font-bold text-sm">
                        {request.employeeName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-primary-text">{request.employeeName}</p>
                        <p className="text-sm text-primary-text-muted">{request.employeeCode} • {t(`departments.${request.department}`)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden md:table-cell">
                    <span className="badge badge-info">{t(`leaveTypes.${request.type}`)}</span>
                  </td>
                  <td className="hidden lg:table-cell">{formatDate(request.startDate)}</td>
                  <td className="hidden lg:table-cell">{formatDate(request.endDate)}</td>
                  <td className="hidden lg:table-cell text-primary-text">{request.totalDays} {t('common.days')}</td>
                  <td className="hidden xl:table-cell text-primary-text-muted max-w-xs truncate">{request.reason}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(request.status)}`}>
                      {t(`employees.${request.status}`)}
                    </span>
                    {request.approvalStatus && request.approvalStatus !== request.status && (
                      <span className={`badge badge-gray ml-1`}>
                        {t(`approvalStatuses.${request.approvalStatus}`)}
                      </span>
                    )}
                  </td>
                  <td className="hidden md:table-cell text-primary-text-muted">{formatDate(request.requestedAt)}</td>
                  <td className="text-right">
                    {request.status === 'pending' && isCEO && (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApprove(request)}
                          className="btn btn-success text-sm flex items-center gap-1"
                        >
                          <CheckCircle size={14} /> {t('leaveApprovals.approve')}
                        </button>
                        <button
                          onClick={() => handleReject(request)}
                          className="btn btn-danger text-sm flex items-center gap-1"
                        >
                          <XCircle size={14} /> {t('leaveApprovals.reject')}
                        </button>
                      </div>
                    )}
                    {request.status === 'pending' && isHR && !isCEO && (
                      <span className="badge badge-warning">{t('leaveApprovals.hrViewOnly')}</span>
                    )}
                    {request.status !== 'pending' && (
                      <div className="flex items-center justify-end gap-2">
                        {request.reviewedBy && (
                          <span className="text-xs text-primary-text-muted">
                            {t('leaveApprovals.reviewedBy')} {request.reviewedBy}
                          </span>
                        )}
                        {request.reviewedAt && (
                          <span className="text-xs text-primary-text-muted">
                            {t('leaveApprovals.reviewedAt')} {formatDate(request.reviewedAt)}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-primary-text-muted">
                    {t('leaveApprovals.noPendingApprovals')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {approvingRequest && (
        <ConfirmModal
          title={t('leaveApprovals.approveConfirm')}
          message={`${approvingRequest.employeeName} (${approvingRequest.employeeCode}) - ${t(`leaveTypes.${approvingRequest.type}`)} - ${formatDate(approvingRequest.startDate)} to ${formatDate(approvingRequest.endDate)} (${approvingRequest.totalDays} ${t('common.days')})`}
          onConfirm={handleConfirmApprove}
          onCancel={() => setApprovingRequest(null)}
          confirmText={t('common.approve')}
          confirmClass="btn-success"
        />
      )}

      {rejectingRequest && (
        <ConfirmModal
          title={t('leaveApprovals.rejectConfirm')}
          message={`${rejectingRequest.employeeName} (${rejectingRequest.employeeCode}) - ${t(`leaveTypes.${rejectingRequest.type}`)} - ${formatDate(rejectingRequest.startDate)} to ${formatDate(rejectingRequest.endDate)} (${rejectingRequest.totalDays} ${t('common.days')})`}
          onConfirm={handleConfirmReject}
          onCancel={() => { setRejectingRequest(null); setRejectReason(''); }}
          confirmText={t('common.reject')}
          confirmClass="btn-danger"
          showIcon={false}
        >
          <div className="mb-4">
            <label className="form-label">{t('leaveApprovals.rejectReason')}</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="input min-h-[80px] resize-y"
              placeholder={t('leaveApprovals.rejectReason')}
              required
              autoFocus
            />
          </div>
        </ConfirmModal>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bgColor }: {
  title: string;
  value: number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-primary-text-muted">{title}</p>
          <p className="text-2xl lg:text-3xl font-bold text-primary-text mt-1">{value}</p>
        </div>
        <div className={`${bgColor} ${color} p-3 rounded-xl`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('th-TH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'pending': return 'badge-warning';
    case 'approved': return 'badge-success';
    case 'rejected': return 'badge-danger';
    case 'cancelled': return 'badge-gray';
    default: return 'badge-gray';
  }
}

export default LeaveApprovals;