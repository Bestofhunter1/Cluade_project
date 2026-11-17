import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Employee, Department, ContractType, EmployeeStatus, Skill, Certification, SalaryHistoryEntry, BonusHistoryEntry, PerformanceReview, LeaveRequest, ProjectAllocation, EmergencyContact } from '../types';
import { mockEmployees } from '../data/mockEmployees';

interface EmployeeState {
  employees: Employee[];
  selectedEmployee: Employee | null;
  filters: {
    status: EmployeeStatus | 'all';
    department: Department | 'all';
    search: string;
    sortBy: 'nameAsc' | 'nameDesc' | 'hireDateAsc' | 'hireDateDesc' | 'salaryAsc' | 'salaryDesc';
  };
  setEmployees: (employees: Employee[]) => void;
  addEmployee: (employee: Employee) => void;
  updateEmployee: (id: string, data: Partial<Employee>) => void;
  terminateEmployee: (id: string) => void;
  setSelectedEmployee: (employee: Employee | null) => void;
  setFilters: (filters: Partial<EmployeeState['filters']>) => void;
  addProjectAllocation: (employeeId: string, allocation: ProjectAllocation) => void;
  updateProjectAllocation: (employeeId: string, projectId: string, data: Partial<ProjectAllocation>) => void;
  removeProjectAllocation: (employeeId: string, projectId: string) => void;
  addLeaveRequest: (employeeId: string, leaveRequest: LeaveRequest) => void;
  updateLeaveRequest: (employeeId: string, leaveId: string, data: Partial<LeaveRequest>) => void;
  addSkill: (employeeId: string, skill: Skill) => void;
  updateSkill: (employeeId: string, skillId: string, data: Partial<Skill>) => void;
  removeSkill: (employeeId: string, skillId: string) => void;
  addCertification: (employeeId: string, cert: Certification) => void;
  updateCertification: (employeeId: string, certId: string, data: Partial<Certification>) => void;
  removeCertification: (employeeId: string, certId: string) => void;
  addSalaryHistory: (employeeId: string, entry: SalaryHistoryEntry) => void;
  addBonusHistory: (employeeId: string, entry: BonusHistoryEntry) => void;
  addPerformanceReview: (employeeId: string, review: PerformanceReview) => void;
  updateLeaveBalance: (employeeId: string, type: 'annual' | 'sick', used: number) => void;
  getEmployeeById: (id: string) => Employee | undefined;
  getEmployeesByProject: (projectId: string) => Employee[];
  getTotalAllocation: (employeeId: string) => number;
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export const useEmployeeStore = create<EmployeeState>()(
  persist(
    (set, get) => ({
      employees: mockEmployees,
      selectedEmployee: null,
      filters: {
        status: 'all',
        department: 'all',
        search: '',
        sortBy: 'nameAsc',
      },

      setEmployees: (employees) => set({ employees }),

      addEmployee: (employee) =>
        set((state) => ({ employees: [...state.employees, employee] })),

      updateEmployee: (id, data) =>
        set((state) => ({
          employees: state.employees.map((emp) =>
            emp.id === id ? { ...emp, ...data, updatedAt: new Date().toISOString() } : emp
          ),
        })),

      terminateEmployee: (id) =>
        set((state) => ({
          employees: state.employees.map((emp) =>
            emp.id === id ? { ...emp, status: 'terminated' as EmployeeStatus, updatedAt: new Date().toISOString() } : emp
          ),
        })),

      setSelectedEmployee: (employee) => set({ selectedEmployee: employee }),

      setFilters: (filters) =>
        set((state) => ({ filters: { ...state.filters, ...filters } })),

      addProjectAllocation: (employeeId, allocation) =>
        set((state) => ({
          employees: state.employees.map((emp) =>
            emp.id === employeeId
              ? { ...emp, projectAllocations: [...emp.projectAllocations, allocation], updatedAt: new Date().toISOString() }
              : emp
          ),
        })),

      updateProjectAllocation: (employeeId, projectId, data) =>
        set((state) => ({
          employees: state.employees.map((emp) =>
            emp.id === employeeId
              ? {
                  ...emp,
                  projectAllocations: emp.projectAllocations.map((alloc) =>
                    alloc.projectId === projectId ? { ...alloc, ...data } : alloc
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : emp
          ),
        })),

      removeProjectAllocation: (employeeId, projectId) =>
        set((state) => ({
          employees: state.employees.map((emp) =>
            emp.id === employeeId
              ? {
                  ...emp,
                  projectAllocations: emp.projectAllocations.filter((alloc) => alloc.projectId !== projectId),
                  updatedAt: new Date().toISOString(),
                }
              : emp
          ),
        })),

      addLeaveRequest: (employeeId, leaveRequest) =>
        set((state) => ({
          employees: state.employees.map((emp) =>
            emp.id === employeeId
              ? { ...emp, leaveRequests: [...emp.leaveRequests, leaveRequest], updatedAt: new Date().toISOString() }
              : emp
          ),
        })),

      updateLeaveRequest: (employeeId, leaveId, data) =>
        set((state) => ({
          employees: state.employees.map((emp) =>
            emp.id === employeeId
              ? {
                  ...emp,
                  leaveRequests: emp.leaveRequests.map((lr) =>
                    lr.id === leaveId ? { ...lr, ...data } : lr
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : emp
          ),
        })),

      addSkill: (employeeId, skill) =>
        set((state) => ({
          employees: state.employees.map((emp) =>
            emp.id === employeeId
              ? { ...emp, skills: [...emp.skills, skill], updatedAt: new Date().toISOString() }
              : emp
          ),
        })),

      updateSkill: (employeeId, skillId, data) =>
        set((state) => ({
          employees: state.employees.map((emp) =>
            emp.id === employeeId
              ? {
                  ...emp,
                  skills: emp.skills.map((s) => (s.id === skillId ? { ...s, ...data } : s)),
                  updatedAt: new Date().toISOString(),
                }
              : emp
          ),
        })),

      removeSkill: (employeeId, skillId) =>
        set((state) => ({
          employees: state.employees.map((emp) =>
            emp.id === employeeId
              ? { ...emp, skills: emp.skills.filter((s) => s.id !== skillId), updatedAt: new Date().toISOString() }
              : emp
          ),
        })),

      addCertification: (employeeId, cert) =>
        set((state) => ({
          employees: state.employees.map((emp) =>
            emp.id === employeeId
              ? { ...emp, certifications: [...emp.certifications, cert], updatedAt: new Date().toISOString() }
              : emp
          ),
        })),

      updateCertification: (employeeId, certId, data) =>
        set((state) => ({
          employees: state.employees.map((emp) =>
            emp.id === employeeId
              ? {
                  ...emp,
                  certifications: emp.certifications.map((c) => (c.id === certId ? { ...c, ...data } : c)),
                  updatedAt: new Date().toISOString(),
                }
              : emp
          ),
        })),

      removeCertification: (employeeId, certId) =>
        set((state) => ({
          employees: state.employees.map((emp) =>
            emp.id === employeeId
              ? { ...emp, certifications: emp.certifications.filter((c) => c.id !== certId), updatedAt: new Date().toISOString() }
              : emp
          ),
        })),

      addSalaryHistory: (employeeId, entry) =>
        set((state) => ({
          employees: state.employees.map((emp) =>
            emp.id === employeeId
              ? { ...emp, salaryHistory: [...emp.salaryHistory, entry], salary: entry.newSalary, updatedAt: new Date().toISOString() }
              : emp
          ),
        })),

      addBonusHistory: (employeeId, entry) =>
        set((state) => ({
          employees: state.employees.map((emp) =>
            emp.id === employeeId
              ? { ...emp, bonusHistory: [...emp.bonusHistory, entry], updatedAt: new Date().toISOString() }
              : emp
          ),
        })),

      addPerformanceReview: (employeeId, review) =>
        set((state) => ({
          employees: state.employees.map((emp) =>
            emp.id === employeeId
              ? { ...emp, performanceReviews: [...emp.performanceReviews, review], updatedAt: new Date().toISOString() }
              : emp
          ),
        })),

      updateLeaveBalance: (employeeId, type, used) =>
        set((state) => ({
          employees: state.employees.map((emp) =>
            emp.id === employeeId
              ? {
                  ...emp,
                  ...(type === 'annual'
                    ? { annualLeaveUsed: (emp.annualLeaveUsed || 0) + used }
                    : { sickLeaveUsed: (emp.sickLeaveUsed || 0) + used }),
                  updatedAt: new Date().toISOString(),
                }
              : emp
          ),
        })),

      getEmployeeById: (id) => get().employees.find((emp) => emp.id === id),

      getEmployeesByProject: (projectId) =>
        get().employees.filter((emp) =>
          emp.projectAllocations.some((alloc) => alloc.projectId === projectId)
        ),

      getTotalAllocation: (employeeId) => {
        const emp = get().employees.find((e) => e.id === employeeId);
        if (!emp) return 0;
        return emp.projectAllocations.reduce((sum, alloc) => sum + alloc.allocationPercent, 0);
      },
    }),
    {
      name: 'employee-storage',
      partialize: (state) => ({ employees: state.employees }),
    }
  )
);