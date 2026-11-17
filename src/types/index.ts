// Core types for TechWarehouse HR Management System

export type Language = 'th' | 'en';

export type UserRole = 'hr' | 'ceo' | 'employee';

export type EmployeeStatus = 'working' | 'on_leave' | 'sick_leave' | 'terminated';

export type ContractType = 'full_time' | 'part_time' | 'contract' | 'probation';

export type Department =
  | 'engineering'
  | 'design'
  | 'product'
  | 'data'
  | 'devops'
  | 'qa'
  | 'management'
  | 'hr'
  | 'finance'
  | 'marketing'
  | 'sales'
  | 'operations'
  | 'robotics'
  | 'inventory'
  | 'fulfillment'
  | 'warehouse_ops';

export type ProjectRole = 'lead' | 'senior' | 'mid' | 'junior' | 'intern' | 'consultant';

export type RiskLevel = 'low' | 'medium' | 'high';

export type LeaveType = 'annual' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'bereavement' | 'unpaid';

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export type ApprovalStatus = 'pending_ceo' | 'approved' | 'rejected';

export type CostCategory = 'software_license' | 'cloud' | 'hardware' | 'vendor' | 'personnel';

export type SalaryChangeType = 'increase' | 'decrease' | 'adjustment' | 'promotion';

export type BonusType = 'performance' | 'annual' | 'spot' | 'referral' | 'retention' | 'project_completion';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface User {
  id: string;
  email: string;
  password: string; // In real app, this would be hashed
  role: UserRole;
  employeeId?: string;
  name: string;
  language: Language;
  createdAt: string;
}

export interface Employee {
  id: string;
  code: string; // e.g., EMP-001
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationalId: string; // Hidden by default
  address: string;
  department: Department;
  position: string;
  contractType: ContractType;
  salary: number; // Monthly salary in THB
  hireDate: string;
  status: EmployeeStatus;
  managerId?: string;
  avatar?: string;
  // Leave balances
  annualLeaveBalance: number;
  annualLeaveAccrued: number;
  annualLeaveCarriedOver: number;
  sickLeaveBalance: number;
  sickLeaveUsed: number;
  // Skills & certifications
  skills: Skill[];
  certifications: Certification[];
  // Salary history
  salaryHistory: SalaryHistoryEntry[];
  // Bonus history
  bonusHistory: BonusHistoryEntry[];
  // Performance reviews
  performanceReviews: PerformanceReview[];
  // Emergency contact
  emergencyContact: EmergencyContact;
  // Project allocations
  projectAllocations: ProjectAllocation[];
  // Leave requests
  leaveRequests: LeaveRequest[];
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  level: SkillLevel;
  yearsExperience: number;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issuedDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface SalaryHistoryEntry {
  id: string;
  effectiveDate: string;
  previousSalary: number;
  newSalary: number;
  changeType: SalaryChangeType;
  reason: string;
  approvedBy: string;
}

export interface BonusHistoryEntry {
  id: string;
  date: string;
  amount: number;
  type: BonusType;
  description: string;
  approvedBy: string;
}

export interface PerformanceReview {
  id: string;
  reviewPeriod: string; // e.g., "H1 2024", "2024"
  rating: number; // 1-5
  reviewerId: string;
  reviewerName: string;
  strengths: string;
  improvements: string;
  goals: string;
  date: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface ProjectAllocation {
  projectId: string;
  projectName: string;
  role: ProjectRole;
  allocationPercent: number;
  startDate: string;
  endDate?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  approvalStatus?: ApprovalStatus;
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNote?: string;
}

export interface Project {
  id: string;
  code: string; // e.g., P001
  name: string;
  description: string;
  department: Department;
  startDate: string;
  endDate: string;
  budget: number; // Total budget in THB
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  progress: number; // 0-100
  testingDate?: string;
  deploymentDate?: string;
  riskLevel: RiskLevel;
  riskNotes: string;
  // Cost tracking
  personnelCost: number; // Calculated from allocations
  otherCosts: OtherCost[];
  // Monthly progress tracking
  monthlyProgress: MonthlyProgress[];
  // Team allocations
  allocations: ProjectAllocation[];
  createdAt: string;
  updatedAt: string;
}

export interface OtherCost {
  id: string;
  projectId: string;
  category: CostCategory;
  name: string;
  description: string;
  amount: number;
  isRecurring: boolean; // Monthly vs one-time
  startDate: string;
  endDate?: string;
  vendor?: string;
  createdAt: string;
}

export interface MonthlyProgress {
  month: string; // YYYY-MM
  progressPercent: number;
  notes?: string;
}

export interface CostSummary {
  totalBudget: number;
  totalSpent: number;
  totalProjected: number;
  remaining: number;
  overBudgetProjects: number;
  byCategory: {
    category: CostCategory;
    spent: number;
    projected: number;
  }[];
  byProject: {
    projectId: string;
    projectCode: string;
    projectName: string;
    budget: number;
    spent: number;
    projected: number;
    progress: number;
    percentUsed: number;
    isOverBudget: boolean;
  }[];
}

export interface EmployeeDetailTabs {
  contact: EmployeeContactInfo;
  payReviews: EmployeePayReviews;
  skills: EmployeeSkills;
  leave: EmployeeLeaveInfo;
}

export interface EmployeeContactInfo {
  email: string;
  phone: string;
  nationalId: string;
  address: string;
  emergencyContact: EmergencyContact;
}

export interface EmployeePayReviews {
  salaryHistory: SalaryHistoryEntry[];
  bonusHistory: BonusHistoryEntry[];
  performanceReviews: PerformanceReview[];
}

export interface EmployeeSkills {
  skills: Skill[];
  certifications: Certification[];
  totalExperienceYears: number;
}

export interface EmployeeLeaveInfo {
  annualLeaveEntitlement: number;
  annualLeaveAccruedMonthly: number;
  annualLeaveCarriedOver: number;
  annualLeaveRemaining: number;
  sickLeaveEntitlement: number;
  sickLeaveUsed: number;
  sickLeaveRemaining: number;
  leaveRequests: LeaveRequest[];
}

export interface LeaveApprovalRequest extends LeaveRequest {
  employeeName: string;
  employeeCode: string;
  department: string;
}

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  onLeaveEmployees: number;
  sickLeaveEmployees: number;
  totalProjects: number;
  activeProjects: number;
  overBudgetProjects: number;
  totalBudget: number;
  totalSpent: number;
  averageUtilization: number;
}

export interface NavigationItem {
  id: string;
  label: { th: string; en: string };
  icon: string;
  path: string;
  roles: UserRole[];
  children?: NavigationItem[];
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface Settings {
  companyName: string;
  companyNameTh: string;
  annualLeaveBaseDays: number;
  annualLeaveAfter3Years: number;
  annualLeaveAfter5Years: number;
  maxCarryOverDays: number;
  carryOverExpiryDate: string; // MM-DD
  sickLeaveEntitlement: number;
  requiresCeoApproval: boolean;
  defaultTestingDaysBeforeEnd: number;
  defaultDeploymentDaysBeforeEnd: number;
  currency: string;
  locale: string;
}