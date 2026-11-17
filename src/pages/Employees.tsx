import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../store/authStore';
import { useEmployeeStore } from '../store/employeeStore';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, ChevronDown, ChevronUp, Search, Funnel, X } from 'lucide-react';
import EmployeeModal from '../components/EmployeeModal';
import ConfirmModal from '../components/ConfirmModal';
import type { Employee, Department, EmployeeStatus, ContractType } from '../types';

function Employees() {
  const { t } = useTranslation();
  const { hasRole } = useAuth();
  const { employees, filters, setFilters, addEmployee, updateEmployee, terminateEmployee, getTotalAllocation } = useEmployeeStore();
  const navigate = useNavigate();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [terminatingEmployee, setTerminatingEmployee] = useState<Employee | null>(null);
  const [showTerminateConfirm, setShowTerminateConfirm] = useState(false);
  const [showAllocationWarning, setShowAllocationWarning] = useState(false);
  const [pendingAllocation, setPendingAllocation] = useState<{ employeeId: string; projectId: string; allocationPercent: number } | null>(null);

  const canManage = hasRole(['hr', 'ceo']);

  const filteredEmployees = useMemo(() => {
    let result = [...employees];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(emp =>
        emp.firstName.toLowerCase().includes(search) ||
        emp.lastName.toLowerCase().includes(search) ||
        emp.email.toLowerCase().includes(search) ||
        emp.code.toLowerCase().includes(search) ||
        emp.position.toLowerCase().includes(search)
      );
    }

    if (filters.status !== 'all') {
      result = result.filter(emp => emp.status === filters.status);
    }

    if (filters.department !== 'all') {
      result = result.filter(emp => emp.department === filters.department);
    }

    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'nameAsc':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case 'nameDesc':
          return `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`);
        case 'hireDateAsc':
          return new Date(a.hireDate).getTime() - new Date(b.hireDate).getTime();
        case 'hireDateDesc':
          return new Date(b.hireDate).getTime() - new Date(a.hireDate).getTime();
        case 'salaryAsc':
          return a.salary - b.salary;
        case 'salaryDesc':
          return b.salary - a.salary;
        default:
          return 0;
      }
    });

    return result;
  }, [employees, filters]);

  const departments: Department[] = [
    'engineering', 'design', 'product', 'data', 'devops', 'qa',
    'management', 'hr', 'finance', 'marketing', 'sales', 'operations',
    'robotics', 'inventory', 'fulfillment', 'warehouse_ops'
  ];

  const statuses: EmployeeStatus[] = ['working', 'on_leave', 'sick_leave', 'terminated'];

  const handleAddEmployee = (data: Partial<Employee>) => {
    const totalAlloc = getTotalAllocation(data.id || '');
    if (totalAlloc > 100) {
      setShowAllocationWarning(true);
      return;
    }
    addEmployee(data as Employee);
    setShowAddModal(false);
  };

  const handleUpdateEmployee = (data: Partial<Employee>) => {
    if (editingEmployee) {
      const totalAlloc = getTotalAllocation(editingEmployee.id);
      if (totalAlloc > 100) {
        setShowAllocationWarning(true);
        return;
      }
      updateEmployee(editingEmployee.id, data);
      setEditingEmployee(null);
    }
  };

  const handleTerminate = () => {
    if (terminatingEmployee) {
      terminateEmployee(terminatingEmployee.id);
      setTerminatingEmployee(null);
      setShowTerminateConfirm(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-primary-text">{t('employees.title')}</h1>
          <p className="text-primary-text-muted mt-1">{t('employees.subtitle')}</p>
        </div>
        {canManage && (
          <button
            onClick={() => { setEditingEmployee(null); setShowAddModal(true); }}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            {t('employees.addEmployee')}
          </button>
        )}
      </div>

      <div className="card p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-text-muted size-5" />
            <input
              type="search"
              placeholder={t('common.search')}
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="input w-full pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ status: e.target.value as EmployeeStatus | 'all' })}
              className="input w-full sm:w-40"
            >
              <option value="all">{t('employees.filterByStatus')}</option>
              {statuses.map(status => (
                <option key={status} value={status}>{t(`employees.${status}`)}</option>
              ))}
            </select>

            <select
              value={filters.department}
              onChange={(e) => setFilters({ department: e.target.value as Department | 'all' })}
              className="input w-full sm:w-48"
            >
              <option value="all">{t('employees.filterByDepartment')}</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{t(`departments.${dept}`)}</option>
              ))}
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ sortBy: e.target.value as any })}
              className="input w-full sm:w-48"
            >
              <option value="nameAsc">{t('employees.nameAsc')}</option>
              <option value="nameDesc">{t('employees.nameDesc')}</option>
              <option value="hireDateAsc">{t('employees.hireDateAsc')}</option>
              <option value="hireDateDesc">{t('employees.hireDateDesc')}</option>
              <option value="salaryAsc">{t('employees.salaryAsc')}</option>
              <option value="salaryDesc">{t('employees.salaryDesc')}</option>
            </select>

            {(filters.search || filters.status !== 'all' || filters.department !== 'all') && (
              <button
                onClick={() => setFilters({ search: '', status: 'all', department: 'all' })}
                className="btn btn-secondary flex items-center gap-2"
              >
                <X size={16} />
                {t('common.clear')}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="w-12"></th>
                <th>{t('employees.employeeCode')}</th>
                <th>{t('employees.fullName')}</th>
                <th className="hidden md:table-cell">{t('common.email')}</th>
                <th className="hidden lg:table-cell">{t('employees.department')}</th>
                <th className="hidden lg:table-cell">{t('employees.position')}</th>
                <th className="hidden xl:table-cell">{t('employees.contractType')}</th>
                <th className="text-right hidden sm:table-cell">{t('common.status')}</th>
                <th className="text-right w-24">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-primary-hover/50">
                  <td>
                    <div className="w-8 h-8 rounded-full bg-primary-accent/10 flex items-center justify-center text-primary-accent font-bold text-sm">
                      {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                    </div>
                  </td>
                  <td className="font-mono text-sm text-primary-text-muted">{employee.code}</td>
                  <td className="font-medium text-primary-text">{employee.firstName} {employee.lastName}</td>
                  <td className="hidden md:table-cell text-primary-text-muted">{employee.email}</td>
                  <td className="hidden lg:table-cell">
                    <span className="badge badge-info">{t(`departments.${employee.department}`)}</span>
                  </td>
                  <td className="hidden lg:table-cell text-primary-text-muted">{employee.position}</td>
                  <td className="hidden xl:table-cell">
                    <span className="badge badge-gray">{t(`contractTypes.${employee.contractType}`)}</span>
                  </td>
                  <td className="text-right hidden sm:table-cell">
                    <span className={`badge ${getStatusBadgeClass(employee.status)}`}>
                      {t(`employees.${employee.status}`)}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => navigate(`/employees/${employee.id}`)}
                        className="p-2 text-primary-text-muted hover:text-primary-text hover:bg-primary-hover rounded-lg transition-colors"
                        title={t('employees.viewDetails')}
                      >
                        <svg size={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                      {canManage && employee.status !== 'terminated' && (
                        <>
                          <button
                            onClick={() => { setEditingEmployee(employee); }}
                            className="p-2 text-primary-text-muted hover:text-primary-text hover:bg-primary-hover rounded-lg transition-colors"
                            title={t('common.edit')}
                          >
                            <svg size={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => { setTerminatingEmployee(employee); setShowTerminateConfirm(true); }}
                            className="p-2 text-primary-text-muted hover:text-primary-danger hover:bg-primary-danger/10 rounded-lg transition-colors"
                            title={t('employees.terminateEmployee')}
                          >
                            <svg size={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-primary-text-muted">
                    {t('common.noData')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-primary-border flex items-center justify-between">
          <p className="text-sm text-primary-text-muted">
            {t('common.showing')} {filteredEmployees.length} {t('common.of')} {employees.length} {t('common.results')}
          </p>
        </div>
      </div>

      {showAddModal && (
        <EmployeeModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddEmployee}
          title={t('employees.addEmployeeTitle')}
        />
      )}

      {editingEmployee && (
        <EmployeeModal
          employee={editingEmployee}
          onClose={() => setEditingEmployee(null)}
          onSubmit={handleUpdateEmployee}
          title={t('employees.editEmployeeTitle')}
        />
      )}

      {showTerminateConfirm && terminatingEmployee && (
        <ConfirmModal
          title={t('employees.terminateConfirmTitle')}
          message={t('employees.terminateConfirmMessage')}
          onConfirm={handleTerminate}
          onCancel={() => { setShowTerminateConfirm(false); setTerminatingEmployee(null); }}
          confirmText={t('employees.terminateSecondConfirm')}
          confirmClass="btn-danger"
          requireDoubleConfirm
        />
      )}

      {showAllocationWarning && (
        <ConfirmModal
          title={t('employees.allocationExceedsWarning')}
          message={t('employees.allocationExceedsConfirm')}
          onConfirm={() => {
            if (editingEmployee) {
              handleUpdateEmployee({});
            } else if (pendingAllocation) {
              // Handle allocation confirmation
            }
            setShowAllocationWarning(false);
          }}
          onCancel={() => setShowAllocationWarning(false)}
          confirmText={t('employees.allocationExceedsConfirm')}
          confirmClass="btn-warning"
        />
      )}
    </div>
  );
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

export default Employees;