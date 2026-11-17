import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../store/authStore';
import { useProjectStore } from '../store/projectStore';
import { useEmployeeStore } from '../store/employeeStore';
import {
  ChevronLeft, DollarSign, TrendingUp, AlertTriangle, Calendar, Clock, Users,
  Plus, Edit, Trash2, FileText, BarChart2, CreditCard, Settings
} from 'lucide-react';
import ProjectModal from '../components/ProjectModal';
import ConfirmModal from '../components/ConfirmModal';
import CostModal from '../components/CostModal';
import AllocationModal from '../components/AllocationModal';
import ProgressModal from '../components/ProgressModal';
import { formatCurrency, formatDate } from '../utils/format';
import type { Project, OtherCost, MonthlyProgress, ProjectAllocation, CostCategory, RiskLevel, Department } from '../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';

function ProjectDetail() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const { projects, getProjectById, updateProject, deleteProject, addCost, updateCost, removeCost, addMonthlyProgress, updateMonthlyProgress, addAllocation, updateAllocation, removeAllocation } = useProjectStore();
  const { employees } = useEmployeeStore();

  const canManage = hasRole(['hr', 'ceo']);
  const project = getProjectById(id || '');
  const [activeTab, setActiveTab] = useState<'overview' | 'costs' | 'progress' | 'team' | 'risks'>('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddCost, setShowAddCost] = useState(false);
  const [editingCost, setEditingCost] = useState<OtherCost | null>(null);
  const [showAddAllocation, setShowAddAllocation] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState<ProjectAllocation | null>(null);
  const [showAddProgress, setShowAddProgress] = useState(false);
  const [editingProgress, setEditingProgress] = useState<MonthlyProgress | null>(null);

  const tabs = [
    { id: 'overview', label: t('projects.summary'), icon: FileText },
    { id: 'costs', label: t('projects.costBreakdown'), icon: DollarSign },
    { id: 'progress', label: t('projects.monthlyProgress'), icon: BarChart2 },
    { id: 'team', label: t('projects.allocations'), icon: Users },
    { id: 'risks', label: t('projects.riskLevel'), icon: AlertTriangle },
  ];

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-primary-text-muted">{t('common.noData')}</p>
          <button onClick={() => navigate('/projects')} className="btn btn-primary mt-4">{t('common.back')}</button>
        </div>
      </div>
    );
  }

  const totalAllocation = project.allocations.reduce((sum, a) => sum + a.allocationPercent, 0);
  const costSummary = calculateProjectCosts(project);
  const isOverBudget = costSummary.totalSpent > project.budget;
  const budgetUtilization = project.budget > 0 ? (costSummary.totalSpent / project.budget) * 100 : 0;

  const monthlyProgressChartData = project.monthlyProgress
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(mp => ({ month: mp.month, progress: mp.progressPercent }));

  const costCategoryData = [
    { category: t('costCategories.personnel'), spent: costSummary.personnelSpent, projected: costSummary.personnelProjected, color: '#58A6FF' },
    { category: t('costCategories.software_license'), spent: costSummary.byCategory.software_license?.spent || 0, projected: costSummary.byCategory.software_license?.projected || 0, color: '#3FB950' },
    { category: t('costCategories.cloud'), spent: costSummary.byCategory.cloud?.spent || 0, projected: costSummary.byCategory.cloud?.projected || 0, color: '#D29922' },
    { category: t('costCategories.hardware'), spent: costSummary.byCategory.hardware?.spent || 0, projected: costSummary.byCategory.hardware?.projected || 0, color: '#F85149' },
    { category: t('costCategories.vendor'), spent: costSummary.byCategory.vendor?.spent || 0, projected: costSummary.byCategory.vendor?.projected || 0, color: '#A371F7' },
  ].filter(c => c.spent > 0 || c.projected > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/projects')} className="p-2 text-primary-text-muted hover:text-primary-text hover:bg-primary-hover rounded-lg transition-colors lg:hidden">
            <ChevronLeft size={20} />
          </button>
          <div className="w-12 h-12 rounded-xl bg-primary-accent/10 flex items-center justify-center">
            <TrendingUp size={24} className="text-primary-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary-text">{project.code}: {project.name}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-primary-text-muted">
              <span className="badge badge-info">{t(`departments.${project.department}`)}</span>
              <span className={`badge ${getStatusBadgeClass(project.status)}`}>{t(`projectStatuses.${project.status}`)}</span>
              <span className={`badge ${getRiskBadgeClass(project.riskLevel)}`}>{t(`riskLevels.${project.riskLevel}`)}</span>
            </div>
          </div>
        </div>
        {canManage && (
          <div className="flex items-center gap-2">
            <button onClick={() => setShowEditModal(true)} className="btn btn-secondary flex items-center gap-2">
              <Edit size={16} /> {t('common.edit')}
            </button>
            <button onClick={() => setShowDeleteConfirm(true)} className="btn btn-danger flex items-center gap-2">
              <Trash2 size={16} /> {t('common.delete')}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={t('projects.budget')} value={formatCurrency(project.budget)} icon={DollarSign} color="text-primary-accent" bgColor="bg-primary-accent/10" />
        <StatCard title={t('projects.totalSpent')} value={formatCurrency(costSummary.totalSpent)} icon={DollarSign} color={isOverBudget ? 'text-primary-danger' : 'text-primary-warning'} bgColor={isOverBudget ? 'bg-primary-danger/10' : 'bg-primary-warning/10'} trend={{ value: `${budgetUtilization.toFixed(1)}%`, label: t('projects.spentPercent'), positive: !isOverBudget }} />
        <StatCard title={t('projects.remaining')} value={formatCurrency(Math.max(0, project.budget - costSummary.totalSpent))} icon={DollarSign} color={costSummary.totalSpent < project.budget ? 'text-primary-success' : 'text-primary-danger'} bgColor={costSummary.totalSpent < project.budget ? 'bg-primary-success/10' : 'bg-primary-danger/10'} />
        <StatCard title={t('projects.progress')} value={`${project.progress}%`} icon={TrendingUp} color="text-primary-success" bgColor="bg-primary-success/10" />
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
          {activeTab === 'overview' && <OverviewTab project={project} costSummary={costSummary} t={t} />}
          {activeTab === 'costs' && <CostsTab project={project} costSummary={costSummary} t={t} canManage={canManage} onAddCost={setShowAddCost} onEditCost={setEditingCost} />}
          {activeTab === 'progress' && <ProgressTab project={project} monthlyProgressChartData={monthlyProgressChartData} t={t} canManage={canManage} onAddProgress={setShowAddProgress} onEditProgress={setEditingProgress} />}
          {activeTab === 'team' && <TeamTab project={project} employees={employees} t={t} canManage={canManage} onAddAllocation={setShowAddAllocation} onEditAllocation={setEditingAllocation} />}
          {activeTab === 'risks' && <RisksTab project={project} t={t} />}
        </div>
      </div>

      {showEditModal && (
        <ProjectModal
          project={project}
          onClose={() => setShowEditModal(false)}
          onSubmit={(data) => updateProject(project.id, data)}
          title={t('projects.editProject')}
        />
      )}

      {showDeleteConfirm && (
        <ConfirmModal
          title={t('common.delete')}
          message={t('common.confirmDelete', { name: project.name })}
          onConfirm={() => { deleteProject(project.id); navigate('/projects'); }}
          onCancel={() => setShowDeleteConfirm(false)}
          confirmClass="btn-danger"
        />
      )}

      {showAddCost && <CostModal projectId={project.id} onClose={() => setShowAddCost(false)} onSubmit={(data) => addCost(project.id, { ...data, id: `cost-${Date.now()}`, projectId: project.id, createdAt: new Date().toISOString().split('T')[0] })} t={t} />}
      {editingCost && <CostModal projectId={project.id} onClose={() => setEditingCost(null)} onSubmit={(data) => updateCost(project.id, editingCost.id, data)} cost={editingCost} t={t} />}

      {showAddAllocation && <AllocationModal projectId={project.id} employees={employees} onClose={() => setShowAddAllocation(false)} onSubmit={(data) => addAllocation(project.id, { ...data, projectId: project.id })} allocation={editingAllocation || undefined} t={t} />}
      {editingAllocation && <AllocationModal projectId={project.id} employees={employees} onClose={() => setEditingAllocation(null)} onSubmit={(data) => updateAllocation(project.id, editingAllocation.projectId, data)} allocation={editingAllocation} t={t} />}

      {showAddProgress && <ProgressModal projectId={project.id} onClose={() => setShowAddProgress(false)} onSubmit={(data) => addMonthlyProgress(project.id, { ...data, month: data.month }) } progress={editingProgress || undefined} t={t} />}
      {editingProgress && <ProgressModal projectId={project.id} onClose={() => setEditingProgress(null)} onSubmit={(data) => updateMonthlyProgress(project.id, editingProgress.month, data)} progress={editingProgress} t={t} />}
    </div>
  );
}

function OverviewTab({ project, costSummary, t }: { project: Project; costSummary: any; t: (key: string) => string }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-primary-text">{t('common.description')}</h3>
          <p className="text-primary-text-muted">{project.description}</p>
        </div>
        <div className="space-y-4">
          <h3 className="font-semibold text-primary-text">{t('projects.keyDates')}</h3>
          <div className="space-y-3">
            <DateRow icon={Calendar} label={t('projects.startDate')} value={formatDate(project.startDate)} />
            <DateRow icon={Calendar} label={t('projects.endDate')} value={formatDate(project.endDate)} />
            {project.testingDate && <DateRow icon={Calendar} label={t('projects.testingDate')} value={formatDate(project.testingDate)} />}
            {project.deploymentDate && <DateRow icon={Calendar} label={t('projects.deploymentDate')} value={formatDate(project.deploymentDate)} />}
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-primary-text mb-4">{t('projects.budgetOverview')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <BudgetStat label={t('projects.personnelCost')} value={formatCurrency(costSummary.personnelSpent)} projected={formatCurrency(costSummary.personnelProjected)} />
          <BudgetStat label={t('costCategories.software_license')} value={formatCurrency(costSummary.byCategory.software_license?.spent || 0)} projected={formatCurrency(costSummary.byCategory.software_license?.projected || 0)} />
          <BudgetStat label={t('costCategories.cloud')} value={formatCurrency(costSummary.byCategory.cloud?.spent || 0)} projected={formatCurrency(costSummary.byCategory.cloud?.projected || 0)} />
          <BudgetStat label={t('costCategories.hardware')} value={formatCurrency(costSummary.byCategory.hardware?.spent || 0)} projected={formatCurrency(costSummary.byCategory.hardware?.projected || 0)} />
        </div>
        <BudgetStat label={t('costCategories.vendor')} value={formatCurrency(costSummary.byCategory.vendor?.spent || 0)} projected={formatCurrency(costSummary.byCategory.vendor?.projected || 0)} className="md:col-span-2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={t('projects.costBreakdown')}>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={costSummary.byCategoryArray}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {costSummary.byCategoryArray.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '8px' }} formatter={(value: number) => [formatCurrency(value), '']} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title={t('projects.monthlyProgress')}>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={project.monthlyProgress.sort((a, b) => a.month.localeCompare(b.month))}>
              <defs>
                <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#58A6FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#58A6FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
              <XAxis dataKey="month" tick={{ fill: '#8B949E', fontSize: 11 }} />
              <YAxis tick={{ fill: '#8B949E', fontSize: 11 }} domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="progressPercent" stroke="#58A6FF" strokeWidth={2} fillOpacity={1} fill="url(#colorProgress)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

function CostsTab({ project, costSummary, t, canManage, onAddCost, onEditCost }: { project: Project; costSummary: any; t: (key: string) => string; canManage: boolean; onAddCost: () => void; onEditCost: (cost: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-primary-text">{t('projects.costBreakdown')}</h3>
        {canManage && (
          <button onClick={onAddCost} className="btn btn-primary flex items-center gap-2">
            <Plus size={16} /> {t('projects.addCost')}
          </button>
        )}
      </div>

      <div className="space-y-3">
        {project.otherCosts.length > 0 ? (
          project.otherCosts.map(cost => {
            const monthsElapsed = calculateMonthsElapsed(cost.startDate, cost.endDate);
            const totalMonths = cost.endDate ? calculateMonthsElapsed(cost.startDate, cost.endDate) : 12;
            const spent = cost.isRecurring ? cost.amount * Math.min(monthsElapsed, totalMonths) : (new Date(cost.startDate) <= new Date() ? cost.amount : 0);
            const projected = cost.isRecurring ? cost.amount * totalMonths : cost.amount;

            return (
              <CostRow key={cost.id} cost={cost} spent={spent} projected={projected} t={t} canManage={canManage} onEdit={onEditCost} onDelete={() => {}} />
            );
          })
        ) : (
          <div className="text-center py-8 text-primary-text-muted">{t('common.noData')}</div>
        )}
      </div>

      <div className="pt-4 border-t border-primary-border">
        <h3 className="font-semibold text-primary-text mb-4">{t('projects.summary')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <BudgetStat label={t('projects.personnelCost')} value={formatCurrency(costSummary.personnelSpent)} projected={formatCurrency(costSummary.personnelProjected)} />
          <BudgetStat label={t('projects.otherCosts')} value={formatCurrency(costSummary.otherSpent)} projected={formatCurrency(costSummary.otherProjected)} />
          <BudgetStat label={t('projects.total')} value={formatCurrency(costSummary.totalSpent)} projected={formatCurrency(costSummary.totalProjected)} className="bg-primary-accent/10 border border-primary-accent/20" />
        </div>
      </div>
    </div>
  );
}

function ProgressTab({ project, monthlyProgressChartData, t, canManage, onAddProgress, onEditProgress }: { project: Project; monthlyProgressChartData: any[]; t: (key: string) => string; canManage: boolean; onAddProgress: () => void; onEditProgress: (progress: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-primary-text">{t('projects.monthlyProgress')}</h3>
        {canManage && (
          <button onClick={onAddProgress} className="btn btn-primary flex items-center gap-2">
            <Plus size={16} /> {t('projects.updateProgress')}
          </button>
        )}
      </div>

      <Card title="" className="p-0">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyProgressChartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
            <XAxis type="number" tick={{ fill: '#8B949E', fontSize: 11 }} domain={[0, 100]} />
            <YAxis dataKey="month" type="category" tick={{ fill: '#8B949E', fontSize: 11 }} width={80} />
            <Tooltip contentStyle={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '8px' }} formatter={(value: number) => [`${value}%`, '']} />
            <Bar dataKey="progress" name={t('projects.progress')} fill="#58A6FF" radius={[0, 4, 4, 0]} maxBarSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div>
        <h3 className="font-semibold text-primary-text mb-4">{t('projects.progressSummary')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title={t('projects.currentProgress')} value={`${project.progress}%`} icon={TrendingUp} color="text-primary-success" bgColor="bg-primary-success/10" />
          <StatCard title={t('projects.averageMonthlyProgress')} value={`${calculateAverageProgress(project.monthlyProgress)}%`} icon={TrendingUp} color="text-primary-accent" bgColor="bg-primary-accent/10" />
          <StatCard title={t('projects.monthsElapsed')} value={project.monthlyProgress.length} icon={Calendar} color="text-primary-info" bgColor="bg-primary-info/10" />
          <StatCard title={t('projects.projectedCompletion')} value={project.monthlyProgress.length > 0 ? project.monthlyProgress[project.monthlyProgress.length - 1].month : '-'} icon={Calendar} color="text-primary-warning" bgColor="bg-primary-warning/10" />
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-primary-text mb-4">{t('projects.progressNote')}</h3>
        <div className="space-y-3">
          {project.monthlyProgress
            .sort((a, b) => b.month.localeCompare(a.month))
            .map(mp => (
              <div key={mp.month} className="p-4 bg-primary-bg/50 rounded-lg border border-primary-border/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-primary-text">{mp.month}</span>
                  <span className="badge badge-info">{mp.progressPercent}%</span>
                </div>
                {mp.notes && <p className="text-sm text-primary-text-muted">{mp.notes}</p>}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function TeamTab({ project, employees, t, canManage, onAddAllocation, onEditAllocation }: { project: Project; employees: any[]; t: (key: string) => string; canManage: boolean; onAddAllocation: () => void; onEditAllocation: (alloc: ProjectAllocation) => void }) {
  const totalAllocation = project.allocations.reduce((sum, a) => sum + a.allocationPercent, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-primary-text">{t('projects.allocations')}</h3>
        {canManage && (
          <button onClick={onAddAllocation} className="btn btn-primary flex items-center gap-2">
            <Plus size={16} /> {t('projects.addAllocation')}
          </button>
        )}
      </div>

      {totalAllocation > 100 && (
        <div className="p-4 bg-primary-warning/10 border border-primary-warning/20 rounded-lg flex items-center gap-3">
          <AlertTriangle size={20} className="text-primary-warning" />
          <p className="text-primary-warning">{t('employees.allocationExceedsWarning')} {totalAllocation}%</p>
        </div>
      )}

      <div className="space-y-3">
        {project.allocations.length > 0 ? (
          project.allocations.map(alloc => {
            const emp = employees.find(e => e.id === alloc.projectId);
            return (
              <AllocationRow key={alloc.projectId} allocation={alloc} employee={emp} t={t} canManage={canManage} onEdit={onEditAllocation} onRemove={() => {}} />
            );
          })
        ) : (
          <div className="text-center py-8 text-primary-text-muted">{t('common.noData')}</div>
        )}
      </div>

      <div className="pt-4 border-t border-primary-border">
        <h3 className="font-semibold text-primary-text mb-4">{t('projects.availableEmployees')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {employees
            .filter(e => e.status === 'working' && !project.allocations.some(a => a.projectId === e.id))
            .slice(0, 12)
            .map(emp => (
              <button
                key={emp.id}
                onClick={() => {}}
                className="p-3 bg-primary-bg/50 rounded-lg border border-primary-border/50 hover:border-primary-accent/50 transition-colors text-left"
              >
                <div className="font-medium text-primary-text">{emp.firstName} {emp.lastName}</div>
                <div className="text-sm text-primary-text-muted">{emp.code} • {t(`departments.${emp.department}`)}</div>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}

function RisksTab({ project, t }: { project: Project; t: (key: string) => string }) {
  const riskColors = { low: 'text-primary-success', medium: 'text-primary-warning', high: 'text-primary-danger' };
  const riskBgColors = { low: 'bg-primary-success/10', medium: 'bg-primary-warning/10', high: 'bg-primary-danger/10' };

  return (
    <div className="space-y-6">
      <div className={`p-5 rounded-xl ${riskBgColors[project.riskLevel]} border border-primary-border/50`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary-bg flex items-center justify-center">
            <AlertTriangle size={24} className={riskColors[project.riskLevel]} />
          </div>
          <div>
            <h3 className="font-semibold text-primary-text">{t('projects.riskLevel')}: {t(`riskLevels.${project.riskLevel}`)}</h3>
            <p className="text-primary-text-muted mt-1">{project.riskNotes || t('common.noData')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <h3 className="font-semibold text-primary-text">{t('projects.testingDate')}</h3>
          <p className="text-primary-text-muted">{project.testingDate ? formatDate(project.testingDate) : t('common.notSet')}</p>
        </div>
        <div className="space-y-4">
          <h3 className="font-semibold text-primary-text">{t('projects.deploymentDate')}</h3>
          <p className="text-primary-text-muted">{project.deploymentDate ? formatDate(project.deploymentDate) : t('common.notSet')}</p>
        </div>
        <div className="space-y-4">
          <h3 className="font-semibold text-primary-text">{t('projects.daysRemaining')}</h3>
          <p className="text-primary-text">{calculateDaysRemaining(project.endDate)} {t('common.days')}</p>
        </div>
        <div className="space-y-4">
          <h3 className="font-semibold text-primary-text">{t('projects.budgetHealth')}</h3>
          <p className="text-primary-text">{project.budget > 0 ? `${((project.budget - calculateProjectCosts(project).totalSpent) / project.budget * 100).toFixed(1)}%` : 'N/A'} {t('projects.margin')}</p>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-primary-text mb-4">{t('projects.riskNotes')}</h3>
        <div className="p-4 bg-primary-bg/50 rounded-lg border border-primary-border/50">
          <p className="text-primary-text-muted whitespace-pre-wrap">{project.riskNotes || t('common.noData')}</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bgColor, trend }: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  bgColor: string;
  trend?: { value: string; label: string; positive: boolean };
}) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-primary-text-muted">{title}</p>
          <p className="text-2xl lg:text-3xl font-bold text-primary-text mt-1">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-sm font-medium ${trend.positive ? 'text-primary-success' : 'text-primary-danger'}`}>
                {trend.positive ? '↑' : '↓'} {trend.value}
              </span>
              <span className="text-sm text-primary-text-muted">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={`${bgColor} ${color} p-3 rounded-xl`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

function Card({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`card p-5 ${className}`}>
      {title && <h3 className="text-lg font-semibold text-primary-text mb-4">{title}</h3>}
      {children}
    </div>
  );
}

function DateRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ size?: number }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-primary-bg/50 rounded-lg">
      <Icon size={18} className="text-primary-text-muted" />
      <div>
        <p className="text-xs text-primary-text-muted">{label}</p>
        <p className="text-primary-text">{value}</p>
      </div>
    </div>
  );
}

function BudgetStat({ label, value, projected, className = '' }: { label: string; value: string; projected: string; className?: string }) {
  return (
    <div className={`p-4 bg-primary-bg/50 rounded-lg border border-primary-border/50 ${className}`}>
      <p className="text-xs text-primary-text-muted">{label}</p>
      <p className="text-lg font-bold text-primary-text">{value}</p>
      <p className="text-xs text-primary-text-muted">{projected} {t('common.projected')}</p>
    </div>
  );
}

function CostRow({ cost, spent, projected, t, canManage, onEdit, onDelete }: { cost: OtherCost; spent: number; projected: number; t: (key: string) => string; canManage: boolean; onEdit: (cost: any) => void; onDelete: () => void }) {
  return (
    <div className="p-4 bg-primary-bg/50 rounded-lg border border-primary-border/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="badge badge-info">{t(`costCategories.${cost.category}`)}</span>
          <div>
            <p className="font-medium text-primary-text">{cost.name}</p>
            <p className="text-sm text-primary-text-muted">
              {cost.vendor && `${cost.vendor} • `}
              {cost.isRecurring ? t('projects.monthly') : t('projects.oneTime')} •
              {formatDate(cost.startDate)} {cost.endDate ? `→ ${formatDate(cost.endDate)}` : ''}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-medium text-primary-text">{formatCurrency(spent)}</p>
          <p className="text-xs text-primary-text-muted">{formatCurrency(projected)} {t('common.projected')}</p>
        </div>
      </div>
      {cost.description && <p className="text-sm text-primary-text-muted mt-2">{cost.description}</p>}
    </div>
  );
}

function AllocationRow({ allocation, employee, t, canManage, onEdit, onRemove }: { allocation: ProjectAllocation; employee: any; t: (key: string) => string; canManage: boolean; onEdit: (alloc: ProjectAllocation) => void; onRemove: () => void }) {
  return (
    <div className="p-4 bg-primary-bg/50 rounded-lg border border-primary-border/50 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-primary-accent/10 flex items-center justify-center">
          <Users size={18} className="text-primary-accent" />
        </div>
        <div>
          <p className="font-medium text-primary-text">{employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown'}</p>
          <p className="text-sm text-primary-text-muted">
            {employee ? employee.code : ''} • {t(`projects.${allocation.role}`)} • {allocation.allocationPercent}% •
            {formatDate(allocation.startDate)} {allocation.endDate ? `→ ${formatDate(allocation.endDate)}` : ''}
          </p>
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

function calculateProjectCosts(project: Project) {
  let personnelSpent = project.personnelCost;
  let personnelProjected = project.personnelCost * 12;
  let otherSpent = 0;
  let otherProjected = 0;
  const byCategory: Record<CostCategory, { spent: number; projected: number }> = {
    software_license: { spent: 0, projected: 0 },
    cloud: { spent: 0, projected: 0 },
    hardware: { spent: 0, projected: 0 },
    vendor: { spent: 0, projected: 0 },
    personnel: { spent: personnelSpent, projected: personnelProjected },
  };
  const now = new Date();

  for (const cost of project.otherCosts) {
    const startDate = new Date(cost.startDate);
    const endDate = cost.endDate ? new Date(cost.endDate) : null;
    const monthsElapsed = Math.max(0, (now.getFullYear() - startDate.getFullYear()) * 12 + now.getMonth() - startDate.getMonth() + 1);
    const totalMonths = endDate
      ? Math.max(0, (endDate.getFullYear() - startDate.getFullYear()) * 12 + endDate.getMonth() - startDate.getMonth() + 1)
      : 12;

    if (cost.isRecurring) {
      const spent = cost.amount * Math.min(monthsElapsed, totalMonths);
      const projected = cost.amount * totalMonths;
      byCategory[cost.category].spent += spent;
      byCategory[cost.category].projected += projected;
      otherSpent += spent;
      otherProjected += projected;
    } else {
      if (startDate <= now) {
        byCategory[cost.category].spent += cost.amount;
        otherSpent += cost.amount;
      }
      byCategory[cost.category].projected += cost.amount;
      otherProjected += cost.amount;
    }
  }

  const byCategoryArray = Object.entries(byCategory)
    .filter(([, v]) => v.spent > 0 || v.projected > 0)
    .map(([category, v], i) => ({
      name: category.replace('_', ' '),
      value: v.spent,
      color: ['#58A6FF', '#3FB950', '#D29922', '#F85149', '#A371F7'][i % 5],
    }));

  return {
    personnelSpent,
    personnelProjected,
    otherSpent,
    otherProjected,
    totalSpent: personnelSpent + otherSpent,
    totalProjected: personnelProjected + otherProjected,
    byCategory,
    byCategoryArray,
  };
}

function calculateMonthsElapsed(startDate: string, endDate?: string): number {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  return Math.max(0, (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth() + 1);
}

function calculateAverageProgress(monthlyProgress: MonthlyProgress[]): number {
  if (monthlyProgress.length === 0) return 0;
  const sum = monthlyProgress.reduce((acc, mp) => acc + mp.progressPercent, 0);
  return Math.round(sum / monthlyProgress.length);
}

function calculateDaysRemaining(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
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

export default ProjectDetail;