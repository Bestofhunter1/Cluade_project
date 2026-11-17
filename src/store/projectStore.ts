import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project, OtherCost, MonthlyProgress, ProjectAllocation, CostCategory, RiskLevel, Department, CostSummary } from '../types';
import { mockProjects } from '../data/mockProjects';

interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  filters: {
    status: Project['status'] | 'all';
    department: Department | 'all';
    riskLevel: RiskLevel | 'all';
    search: string;
  };
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setSelectedProject: (project: Project | null) => void;
  setFilters: (filters: Partial<ProjectState['filters']>) => void;
  addCost: (projectId: string, cost: OtherCost) => void;
  updateCost: (projectId: string, costId: string, data: Partial<OtherCost>) => void;
  removeCost: (projectId: string, costId: string) => void;
  addMonthlyProgress: (projectId: string, progress: MonthlyProgress) => void;
  updateMonthlyProgress: (projectId: string, month: string, data: Partial<MonthlyProgress>) => void;
  addAllocation: (projectId: string, allocation: ProjectAllocation) => void;
  updateAllocation: (projectId: string, employeeId: string, data: Partial<ProjectAllocation>) => void;
  removeAllocation: (projectId: string, employeeId: string) => void;
  recalculateProjectCosts: (projectId: string) => void;
  getProjectById: (id: string) => Project | undefined;
  getCostSummary: () => CostSummary;
  getProjectsByDepartment: (department: Department) => Project[];
  getOverBudgetProjects: () => Project[];
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function calculatePersonnelCost(project: Project, employees: any[]): number {
  let total = 0;
  for (const alloc of project.allocations) {
    const emp = employees.find((e) => e.id === alloc.projectId?.replace('alloc-', '') || e.id === alloc.projectId);
    if (emp) {
      const monthlySalary = emp.salary;
      const allocationPercent = alloc.allocationPercent / 100;
      total += monthlySalary * allocationPercent;
    }
  }
  return total;
}

function calculateOtherCosts(project: Project): { spent: number; projected: number } {
  let spent = 0;
  let projected = 0;
  const now = new Date();

  for (const cost of project.otherCosts) {
    const startDate = new Date(cost.startDate);
    const endDate = cost.endDate ? new Date(cost.endDate) : null;

    if (cost.isRecurring) {
      const monthsElapsed = Math.max(0, (now.getFullYear() - startDate.getFullYear()) * 12 + now.getMonth() - startDate.getMonth() + 1);
      const totalMonths = endDate
        ? Math.max(0, (endDate.getFullYear() - startDate.getFullYear()) * 12 + endDate.getMonth() - startDate.getMonth() + 1)
        : 12;
      spent += cost.amount * Math.min(monthsElapsed, totalMonths);
      projected += cost.amount * totalMonths;
    } else {
      if (startDate <= now) {
        spent += cost.amount;
      }
      projected += cost.amount;
    }
  }
  return { spent, projected };
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: mockProjects,
      selectedProject: null,
      filters: {
        status: 'all',
        department: 'all',
        riskLevel: 'all',
        search: '',
      },

      setProjects: (projects) => set({ projects }),

      addProject: (project) =>
        set((state) => ({ projects: [...state.projects, project] })),

      updateProject: (id, data) =>
        set((state) => ({
          projects: state.projects.map((proj) =>
            proj.id === id ? { ...proj, ...data, updatedAt: new Date().toISOString() } : proj
          ),
        })),

      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((proj) => proj.id !== id),
        })),

      setSelectedProject: (project) => set({ selectedProject: project }),

      setFilters: (filters) =>
        set((state) => ({ filters: { ...state.filters, ...filters } })),

      addCost: (projectId, cost) =>
        set((state) => ({
          projects: state.projects.map((proj) =>
            proj.id === projectId
              ? { ...proj, otherCosts: [...proj.otherCosts, cost], updatedAt: new Date().toISOString() }
              : proj
          ),
        })),

      updateCost: (projectId, costId, data) =>
        set((state) => ({
          projects: state.projects.map((proj) =>
            proj.id === projectId
              ? {
                  ...proj,
                  otherCosts: proj.otherCosts.map((c) => (c.id === costId ? { ...c, ...data } : c)),
                  updatedAt: new Date().toISOString(),
                }
              : proj
          ),
        })),

      removeCost: (projectId, costId) =>
        set((state) => ({
          projects: state.projects.map((proj) =>
            proj.id === projectId
              ? { ...proj, otherCosts: proj.otherCosts.filter((c) => c.id !== costId), updatedAt: new Date().toISOString() }
              : proj
          ),
        })),

      addMonthlyProgress: (projectId, progress) =>
        set((state) => ({
          projects: state.projects.map((proj) =>
            proj.id === projectId
              ? { ...proj, monthlyProgress: [...proj.monthlyProgress, progress], updatedAt: new Date().toISOString() }
              : proj
          ),
        })),

      updateMonthlyProgress: (projectId, month, data) =>
        set((state) => ({
          projects: state.projects.map((proj) =>
            proj.id === projectId
              ? {
                  ...proj,
                  monthlyProgress: proj.monthlyProgress.map((p) =>
                    p.month === month ? { ...p, ...data } : p
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : proj
          ),
        })),

      addAllocation: (projectId, allocation) =>
        set((state) => ({
          projects: state.projects.map((proj) =>
            proj.id === projectId
              ? { ...proj, allocations: [...proj.allocations, allocation], updatedAt: new Date().toISOString() }
              : proj
          ),
        })),

      updateAllocation: (projectId, employeeId, data) =>
        set((state) => ({
          projects: state.projects.map((proj) =>
            proj.id === projectId
              ? {
                  ...proj,
                  allocations: proj.allocations.map((alloc) =>
                    alloc.projectId === employeeId ? { ...alloc, ...data } : alloc
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : proj
          ),
        })),

      removeAllocation: (projectId, employeeId) =>
        set((state) => ({
          projects: state.projects.map((proj) =>
            proj.id === projectId
              ? { ...proj, allocations: proj.allocations.filter((alloc) => alloc.projectId !== employeeId), updatedAt: new Date().toISOString() }
              : proj
          ),
        })),

      recalculateProjectCosts: (projectId) => {
        const { projects } = get();
        const project = projects.find((p) => p.id === projectId);
        if (!project) return;

        // Personnel cost will be calculated from employee store
        const { spent, projected } = calculateOtherCosts(project);

        set((state) => ({
          projects: state.projects.map((proj) =>
            proj.id === projectId
              ? { ...proj, otherCosts: proj.otherCosts, updatedAt: new Date().toISOString() }
              : proj
          ),
        }));
      },

      getProjectById: (id) => get().projects.find((proj) => proj.id === id),

      getCostSummary: () => {
        const { projects } = get();
        const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);

        let totalSpent = 0;
        let totalProjected = 0;
        const byCategory: CostSummary['byCategory'] = [];
        const byProject: CostSummary['byProject'] = [];

        const categories: CostCategory[] = ['software_license', 'cloud', 'hardware', 'vendor', 'personnel'];
        const categorySpent: Record<CostCategory, number> = {
          software_license: 0,
          cloud: 0,
          hardware: 0,
          vendor: 0,
          personnel: 0,
        };
        const categoryProjected: Record<CostCategory, number> = {
          software_license: 0,
          cloud: 0,
          hardware: 0,
          vendor: 0,
          personnel: 0,
        };

        for (const project of projects) {
          const { spent: otherSpent, projected: otherProjected } = calculateOtherCosts(project);
          const personnelCost = project.personnelCost;

          totalSpent += otherSpent + personnelCost;
          totalProjected += otherProjected + personnelCost * 12;

          categorySpent.personnel += personnelCost;
          categoryProjected.personnel += personnelCost * 12;

          for (const cost of project.otherCosts) {
            const startDate = new Date(cost.startDate);
            const endDate = cost.endDate ? new Date(cost.endDate) : null;
            const now = new Date();

            if (cost.isRecurring) {
              const monthsElapsed = Math.max(0, (now.getFullYear() - startDate.getFullYear()) * 12 + now.getMonth() - startDate.getMonth() + 1);
              const totalMonths = endDate
                ? Math.max(0, (endDate.getFullYear() - startDate.getFullYear()) * 12 + endDate.getMonth() - startDate.getMonth() + 1)
                : 12;
              categorySpent[cost.category] += cost.amount * Math.min(monthsElapsed, totalMonths);
              categoryProjected[cost.category] += cost.amount * totalMonths;
            } else {
              if (startDate <= now) {
                categorySpent[cost.category] += cost.amount;
              }
              categoryProjected[cost.category] += cost.amount;
            }
          }

          const projectSpent = otherSpent + personnelCost;
          const projectProjected = otherProjected + personnelCost * 12;

          byProject.push({
            projectId: project.id,
            projectCode: project.code,
            projectName: project.name,
            budget: project.budget,
            spent: projectSpent,
            projected: projectProjected,
            progress: project.progress,
            percentUsed: project.budget > 0 ? (projectSpent / project.budget) * 100 : 0,
            isOverBudget: projectSpent > project.budget,
          });
        }

        for (const cat of categories) {
          byCategory.push({
            category: cat,
            spent: categorySpent[cat],
            projected: categoryProjected[cat],
          });
        }

        return {
          totalBudget,
          totalSpent,
          totalProjected,
          remaining: totalBudget - totalSpent,
          overBudgetProjects: projects.filter((p) => {
            const { spent } = calculateOtherCosts(p);
            return spent + p.personnelCost > p.budget;
          }).length,
          byCategory,
          byProject,
        };
      },

      getProjectsByDepartment: (department) =>
        get().projects.filter((p) => p.department === department),

      getOverBudgetProjects: () => {
        const { projects } = get();
        return projects.filter((p) => {
          const { spent } = calculateOtherCosts(p);
          return spent + p.personnelCost > p.budget;
        });
      },
    }),
    {
      name: 'project-storage',
      partialize: (state) => ({ projects: state.projects }),
    }
  )
);