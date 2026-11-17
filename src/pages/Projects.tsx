import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../store/authStore';
import { useProjectStore } from '../store/projectStore';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, Search, Funnel, X, TrendingUp, TrendingDown, DollarSign, AlertTriangle } from 'lucide-react';
import ProjectModal from '../components/ProjectModal';
import ConfirmModal from '../components/ConfirmModal';
import type { Project, Department, RiskLevel } from '../types';

function Projects() {
  const { t } = useTranslation();
  const { hasRole } = useAuth();
  const { projects, filters, setFilters, addProject, updateProject, deleteProject, getCostSummary, getOverBudgetProjects } = useProjectStore();
  const navigate = useNavigate();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const canManage = hasRole(['hr', 'ceo']);
  const costSummary = getCostSummary();

  const filteredProjects = useMemo(() => {
    let result = [...projects];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(proj =>
        proj.name.toLowerCase().includes(search) ||
        proj.code.toLowerCase().includes(search) ||
        proj.description.toLowerCase().includes(search)
      );
    }

    if (filters.status !== 'all') {
      result = result.filter(proj => proj.status === filters.status);
    }

    if (filters.department !== 'all') {
      result = result.filter(proj => proj.department === filters.department);
    }

    if (filters.riskLevel !== 'all') {
      result = result.filter(proj => proj.riskLevel === filters.riskLevel);
    }

    return result;
  }, [projects, filters]);

  const departments: Department[] = [
    'engineering', 'design', 'product', 'data', 'devops', 'qa',
    'management', 'hr', 'finance', 'marketing', 'sales', 'operations',
    'robotics', 'inventory', 'fulfillment', 'warehouse_ops'
  ];

  const statuses: Project['status'][] = ['planning', 'active', 'on_hold', 'completed', 'cancelled'];
  const riskLevels: RiskLevel[] = ['low', 'medium', 'high'];

  const handleAddProject = (data: Partial<Project>) => {
    addProject(data as Project);
    setShowAddModal(false);
  };

  const handleUpdateProject = (data: Partial<Project>) => {
    if (editingProject) {
      updateProject(editingProject.id, data);
      setEditingProject(null);
    }
  };

  const handleDelete = () => {
    if (deletingProject) {
      deleteProject(deletingProject.id);
      setDeletingProject(null);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-primary-text">{t('projects.title')}</h1>
          <p className="text-primary-text-muted mt-1">{t('projects.subtitle')}</p>
        </div>
        {canManage && (
          <button
            onClick={() => { setEditingProject(null); setShowAddModal(true); }}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            {t('projects.addProject')}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('projects.totalBudget')}
          value={formatCurrency(costSummary.totalBudget)}
          icon={DollarSign}
          color="text-primary-accent"
          bgColor="bg-primary-accent/10"
        />
        <StatCard
          title={t('projects.totalSpent')}
          value={formatCurrency(costSummary.totalSpent)}
          icon={DollarSign}
          color="text-primary-warning"
          bgColor="bg-primary-warning/10"
        />
        <StatCard
          title={t('projects.remaining')}
          value={formatCurrency(costSummary.remaining)}
          icon={DollarSign}
          color={costSummary.remaining >= 0 ? 'text-primary-success' : 'text-primary-danger'}
          bgColor={costSummary.remaining >= 0 ? 'bg-primary-success/10' : 'bg-primary-danger/10'}
        />
        <StatCard
          title={t('projects.overBudgetProjects')}
          value={costSummary.overBudgetProjects}
          icon={AlertTriangle}
          color="text-primary-danger"
          bgColor="bg-primary-danger/10"
        />
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
              onChange={(e) => setFilters({ status: e.target.value as any })}
              className="input w-full sm:w-40"
            >
              <option value="all">{t('projects.status')}</option>
              {statuses.map(status => (
                <option key={status} value={status}>{t(`projectStatuses.${status}`)}</option>
              ))}
            </select>

            <select
              value={filters.department}
              onChange={(e) => setFilters({ department: e.target.value as Department | 'all' })}
              className="input w-full sm:w-48"
            >
              <option value="all">{t('projects.byDepartment')}</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{t(`departments.${dept}`)}</option>
              ))}
            </select>

            <select
              value={filters.riskLevel}
              onChange={(e) => setFilters({ riskLevel: e.target.value as RiskLevel | 'all' })}
              className="input w-full sm:w-40"
            >
              <option value="all">{t('projects.riskLevel')}</option>
              {riskLevels.map(risk => (
                <option key={risk} value={risk}>{t(`riskLevels.${risk}`)}</option>
              ))}
            </select>

            {(filters.search || filters.status !== 'all' || filters.department !== 'all' || filters.riskLevel !== 'all') && (
              <button
                onClick={() => setFilters({ search: '', status: 'all', department: 'all', riskLevel: 'all' })}
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
                <th>{t('projects.projectCode')}</th>
                <th>{t('projects.projectName')}</th>
                <th className="hidden md:table-cell">{t('projects.department')}</th>
                <th className="hidden lg:table-cell">{t('common.status')}</th>
                <th className="hidden lg:table-cell">{t('projects.progress')}</th>
                <th className="hidden xl:table-cell">{t('projects.riskLevel')}</th>
                <th className="text-right hidden sm:table-cell">{t('projects.budget')}</th>
                <th className="text-right hidden sm:table-cell">{t('projects.totalSpent')}</th>
                <th className="text-right hidden lg:table-cell">{t('projects.remaining')}</th>
                <th className="text-right w-24">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => {
                const projectCosts = costSummary.byProject.find(p => p.projectId === project.id);
                const isOverBudget = projectCosts?.isOverBudget || false;
                const percentUsed = projectCosts?.percentUsed || 0;

                return (
                  <tr key={project.id} className="hover:bg-primary-hover/50">
                    <td>
                      <div className="w-8 h-8 rounded-lg bg-primary-accent/10 flex items-center justify-center">
                        <TrendingUp size={16} className="text-primary-accent" />
                      </div>
                    </td>
                    <td className="font-mono text-sm text-primary-text-muted">{project.code}</td>
                    <td className="font-medium text-primary-text">{project.name}</td>
                    <td className="hidden md:table-cell">
                      <span className="badge badge-info">{t(`departments.${project.department}`)}</span>
                    </td>
                    <td className="hidden lg:table-cell">
                      <span className={`badge ${getStatusBadgeClass(project.status)}`}>
                        {t(`projectStatuses.${project.status}`)}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell">
                      <div className="w-32">
                        <div className="progress-bar h-2">
                          <div className="progress-fill" style={{ width: `${project.progress}%` }}></div>
                        </div>
                        <p className="text-xs text-primary-text-muted mt-1">{project.progress}%</p>
                      </div>
                    </td>
                    <td className="hidden xl:table-cell">
                      <span className={`badge ${getRiskBadgeClass(project.riskLevel)}`}>
                        {t(`riskLevels.${project.riskLevel}`)}
                      </span>
                    </td>
                    <td className="text-right hidden sm:table-cell text-primary-text">{formatCurrency(project.budget)}</td>
                    <td className="text-right hidden sm:table-cell">
                      <span className={isOverBudget ? 'text-primary-danger font-medium' : 'text-primary-text'}>
                        {formatCurrency(projectCosts?.spent || 0)}
                      </span>
                    </td>
                    <td className="text-right hidden lg:table-cell">
                      <span className={isOverBudget ? 'text-primary-danger font-medium' : 'text-primary-text'}>
                        {formatCurrency(projectCosts?.remaining || project.budget)}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/projects/${project.id}`)}
                          className="p-2 text-primary-text-muted hover:text-primary-text hover:bg-primary-hover rounded-lg transition-colors"
                          title={t('common.view')}
                        >
                          <svg size={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                        {canManage && (
                          <>
                            <button
                              onClick={() => { setEditingProject(project); }}
                              className="p-2 text-primary-text-muted hover:text-primary-text hover:bg-primary-hover rounded-lg transition-colors"
                              title={t('common.edit')}
                            >
                              <svg size={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => { setDeletingProject(project); setShowDeleteConfirm(true); }}
                              className="p-2 text-primary-text-muted hover:text-primary-danger hover:bg-primary-danger/10 rounded-lg transition-colors"
                              title={t('common.delete')}
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
                );
              })}
              {filteredProjects.length === 0 && (
                <tr>
                  <td colSpan={11} className="text-center py-12 text-primary-text-muted">
                    {t('common.noData')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-primary-border flex items-center justify-between">
          <p className="text-sm text-primary-text-muted">
            {t('common.showing')} {filteredProjects.length} {t('common.of')} {projects.length} {t('common.results')}
          </p>
        </div>
      </div>

      {showAddModal && (
        <ProjectModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddProject}
          title={t('projects.addProject')}
        />
      )}

      {editingProject && (
        <ProjectModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onSubmit={handleUpdateProject}
          title={t('projects.editProject')}
        />
      )}

      {showDeleteConfirm && deletingProject && (
        <ConfirmModal
          title={t('common.delete')}
          message={t('common.confirmDelete', { name: deletingProject.name })}
          onConfirm={handleDelete}
          onCancel={() => { setShowDeleteConfirm(false); setDeletingProject(null); }}
          confirmClass="btn-danger"
        />
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bgColor }: {
  title: string;
  value: string | number;
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

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'planning': return 'badge-info';
    case 'active': return 'badge-success';
    case 'on_hold': return 'badge-warning';
    case 'completed': return 'badge-gray';
    case 'cancelled': return 'badge-danger';
    default: return 'badge-gray';
  }
}

function getRiskBadgeClass(risk: string): string {
  switch (risk) {
    case 'low': return 'badge-success';
    case 'medium': return 'badge-warning';
    case 'high': return 'badge-danger';
    default: return 'badge-gray';
  }
}

export default Projects;