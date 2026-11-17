import { useTranslation } from 'react-i18next';
import { useAuth } from '../store/authStore';
import { useEmployeeStore } from '../store/employeeStore';
import { useProjectStore } from '../store/projectStore';
import { TrendingUp, TrendingDown, Users, Briefcase, Clock, AlertTriangle, DollarSign } from 'lucide-react';
import { formatCurrency, formatDate, formatCurrencyShort, formatDateRange } from '../utils/format';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { employees } = useEmployeeStore();
  const { projects, getCostSummary } = useProjectStore();

  const stats = getCostSummary();

  const activeEmployees = employees.filter(e => e.status === 'working').length;
  const onLeaveEmployees = employees.filter(e => e.status === 'on_leave').length;
  const sickLeaveEmployees = employees.filter(e => e.status === 'sick_leave').length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const overBudgetProjects = projects.filter(p => {
    const { spent } = calculateOtherCosts(p);
    return spent + p.personnelCost > p.budget;
  }).length;

  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = stats.totalSpent;
  const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const monthlyBudgetData = [
    { month: 'Jan', budget: 1200000, spent: 980000 },
    { month: 'Feb', budget: 1200000, spent: 1150000 },
    { month: 'Mar', budget: 1200000, spent: 1080000 },
    { month: 'Apr', budget: 1200000, spent: 1220000 },
    { month: 'May', budget: 1200000, spent: 1180000 },
    { month: 'Jun', budget: 1200000, spent: 1350000 },
    { month: 'Jul', budget: 1200000, spent: 1280000 },
    { month: 'Aug', budget: 1200000, spent: 1420000 },
    { month: 'Sep', budget: 1200000, spent: 1380000 },
    { month: 'Oct', budget: 1200000, spent: 1520000 },
    { month: 'Nov', budget: 1200000, spent: 1480000 },
    { month: 'Dec', budget: 1200000, spent: 0 },
  ];

  const projectStatusData = [
    { name: t('projects.planning'), value: projects.filter(p => p.status === 'planning').length, color: '#58A6FF' },
    { name: t('projects.active'), value: projects.filter(p => p.status === 'active').length, color: '#3FB950' },
    { name: t('projects.onHold'), value: projects.filter(p => p.status === 'on_hold').length, color: '#D29922' },
    { name: t('projects.completed'), value: projects.filter(p => p.status === 'completed').length, color: '#8B949E' },
    { name: t('projects.cancelled'), value: projects.filter(p => p.status === 'cancelled').length, color: '#F85149' },
  ].filter(d => d.value > 0);

  const departmentBudgetData = [
    { department: t('departments.engineering'), budget: 16700000, spent: 14200000 },
    { department: t('departments.warehouse_ops'), budget: 5000000, spent: 6200000 },
    { department: t('departments.data'), budget: 4000000, spent: 2800000 },
    { department: t('departments.devops'), budget: 7000000, spent: 4500000 },
    { department: t('departments.robotics'), budget: 3600000, spent: 800000 },
  ];

  const recentProjects = projects
    .filter(p => p.status === 'active' || p.status === 'planning')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const upcomingLeave = employees
    .flatMap(e => e.leaveRequests
      .filter(lr => lr.status === 'approved' && new Date(lr.startDate) >= new Date())
      .map(lr => ({ ...lr, employeeName: `${e.firstName} ${e.lastName}`, employeeCode: e.code }))
    )
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-primary-text">{t('dashboard.title')}</h1>
          <p className="text-primary-text-muted mt-1">{t('dashboard.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-primary-text-muted">{t('common.welcome')}, {user?.name}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('dashboard.totalEmployees')}
          value={employees.length}
          icon={Users}
          color="text-primary-accent"
          bgColor="bg-primary-accent/10"
          trend={{ value: 3, label: t('common.vsLastMonth'), positive: true }}
        />
        <StatCard
          title={t('dashboard.activeEmployees')}
          value={activeEmployees}
          icon={Users}
          color="text-primary-success"
          bgColor="bg-primary-success/10"
          trend={{ value: 2, label: t('common.vsLastMonth'), positive: true }}
        />
        <StatCard
          title={t('dashboard.onLeave')}
          value={onLeaveEmployees + sickLeaveEmployees}
          icon={Clock}
          color="text-primary-warning"
          bgColor="bg-primary-warning/10"
        />
        <StatCard
          title={t('dashboard.totalProjects')}
          value={projects.length}
          icon={Briefcase}
          color="text-primary-info"
          bgColor="bg-primary-info/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('dashboard.activeProjects')}
          value={activeProjects}
          icon={Briefcase}
          color="text-primary-success"
          bgColor="bg-primary-success/10"
        />
        <StatCard
          title={t('dashboard.overBudget')}
          value={overBudgetProjects}
          icon={AlertTriangle}
          color="text-primary-danger"
          bgColor="bg-primary-danger/10"
        />
        <StatCard
          title={t('dashboard.totalBudget')}
          value={formatCurrency(totalBudget)}
          icon={DollarSign}
          color="text-primary-accent"
          bgColor="bg-primary-accent/10"
        />
        <StatCard
          title={t('dashboard.totalSpent')}
          value={formatCurrency(totalSpent)}
          icon={DollarSign}
          color="text-primary-warning"
          bgColor="bg-primary-warning/10"
          trend={{ value: budgetUtilization.toFixed(1), label: t('dashboard.avgUtilization'), positive: budgetUtilization < 80 }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={t('dashboard.budgetOverview')}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyBudgetData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
              <XAxis type="number" tick={{ fill: '#8B949E', fontSize: 11 }} tickFormatter={formatCurrencyShort} />
              <YAxis dataKey="month" type="category" tick={{ fill: '#8B949E', fontSize: 11 }} width={60} />
              <Tooltip
                contentStyle={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '8px' }}
                formatter={(value: number) => [formatCurrency(value), '']}
                labelFormatter={(label: string) => label}
              />
              <Bar dataKey="budget" name={t('dashboard.budget')} fill="#58A6FF" radius={[0, 4, 4, 0]} maxBarSize={30} />
              <Bar dataKey="spent" name={t('dashboard.totalSpent')} fill="#3FB950" radius={[0, 4, 4, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title={t('dashboard.projectHealth')}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={projectStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {projectStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '8px' }}
                formatter={(value: number) => [value.toString(), '']}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={t('dashboard.recentActivity')}>
          <div className="space-y-3">
            {recentProjects.map((project, index) => (
              <div key={project.id} className="flex items-center justify-between p-3 bg-primary-bg/50 rounded-lg hover:bg-primary-hover/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-accent/10 flex items-center justify-center">
                    <Briefcase size={16} className="text-primary-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-primary-text">{project.code}: {project.name}</p>
                    <p className="text-sm text-primary-text-muted">{t('projects.progress')}: {project.progress}%</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`badge ${getStatusBadgeClass(project.status)}`}>
                    {t(`projectStatuses.${project.status}`)}
                  </span>
                  <p className="text-xs text-primary-text-muted mt-1">{formatDate(project.updatedAt)}</p>
                </div>
              </div>
            ))}
            {recentProjects.length === 0 && (
              <div className="text-center py-8 text-primary-text-muted">
                {t('common.noData')}
              </div>
            )}
          </div>
        </Card>

        <Card title={t('dashboard.upcomingLeave')}>
          <div className="space-y-3">
            {upcomingLeave.map((leave, index) => (
              <div key={leave.id} className="flex items-center justify-between p-3 bg-primary-bg/50 rounded-lg hover:bg-primary-hover/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-warning/10 flex items-center justify-center">
                    <Clock size={16} className="text-primary-warning" />
                  </div>
                  <div>
                    <p className="font-medium text-primary-text">{leave.employeeName} ({leave.employeeCode})</p>
                    <p className="text-sm text-primary-text-muted">{t(`leaveTypes.${leave.type}`)} • {leave.totalDays} {t('common.days')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`badge ${getLeaveStatusBadgeClass(leave.status)}`}>
                    {t(`employees.${leave.status}`)}
                  </span>
                  <p className="text-xs text-primary-text-muted mt-1">{formatDateRange(leave.startDate, leave.endDate)}</p>
                </div>
              </div>
            ))}
            {upcomingLeave.length === 0 && (
              <div className="text-center py-8 text-primary-text-muted">
                {t('common.noData')}
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card title={t('dashboard.budgetOverview') + ' ' + t('common.byDepartment')}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={departmentBudgetData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
            <XAxis type="number" tick={{ fill: '#8B949E', fontSize: 11 }} tickFormatter={formatCurrencyShort} />
            <YAxis dataKey="department" type="category" tick={{ fill: '#8B949E', fontSize: 11 }} width={140} />
            <Tooltip
              contentStyle={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '8px' }}
              formatter={(value: number) => [formatCurrency(value), '']}
            />
            <Bar dataKey="budget" name={t('dashboard.budget')} fill="#58A6FF" radius={[0, 4, 4, 0]} maxBarSize={30} />
            <Bar dataKey="spent" name={t('dashboard.totalSpent')} fill="#F85149" radius={[0, 4, 4, 0]} maxBarSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bgColor, trend }: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  bgColor: string;
  trend?: { value: string | number; label: string; positive: boolean };
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

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <h3 className="text-lg font-semibold text-primary-text mb-4">{title}</h3>
      {children}
    </div>
  );
}

function calculateOtherCosts(project: any) {
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

function getLeaveStatusBadgeClass(status: string): string {
  switch (status) {
    case 'pending': return 'badge-warning';
    case 'approved': return 'badge-success';
    case 'rejected': return 'badge-danger';
    case 'cancelled': return 'badge-gray';
    default: return 'badge-gray';
  }
}

export default Dashboard;