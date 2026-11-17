import type {
  Employee,
  Department,
  ContractType,
  EmployeeStatus,
  Skill,
  Certification,
  SalaryHistoryEntry,
  BonusHistoryEntry,
  PerformanceReview,
  LeaveRequest,
  ProjectAllocation,
  EmergencyContact,
  LeaveType,
  LeaveStatus,
  ApprovalStatus,
  SalaryChangeType,
  BonusType,
  SkillLevel,
} from '../types';

const mockSkills: Skill[] = [
  {
    id: 'skill-1',
    name: 'TypeScript',
    category: 'Programming',
    level: 'expert',
    yearsExperience: 5,
  },
  {
    id: 'skill-2',
    name: 'React',
    category: 'Frontend',
    level: 'advanced',
    yearsExperience: 4,
  },
  {
    id: 'skill-3',
    name: 'Node.js',
    category: 'Backend',
    level: 'advanced',
    yearsExperience: 4,
  },
  {
    id: 'skill-4',
    name: 'Python',
    category: 'Programming',
    level: 'intermediate',
    yearsExperience: 3,
  },
  {
    id: 'skill-5',
    name: 'AWS',
    category: 'Cloud',
    level: 'advanced',
    yearsExperience: 3,
  },
  {
    id: 'skill-6',
    name: 'Docker',
    category: 'DevOps',
    level: 'intermediate',
    yearsExperience: 2,
  },
  {
    id: 'skill-7',
    name: 'PostgreSQL',
    category: 'Database',
    level: 'advanced',
    yearsExperience: 4,
  },
  {
    id: 'skill-8',
    name: 'GraphQL',
    category: 'API',
    level: 'intermediate',
    yearsExperience: 2,
  },
];

const mockCertifications: Certification[] = [
  {
    id: 'cert-1',
    name: 'AWS Certified Solutions Architect',
    issuer: 'Amazon Web Services',
    issuedDate: '2023-03-15',
    expiryDate: '2026-03-15',
    credentialId: 'AWS-SA-123456',
    credentialUrl: 'https://aws.amazon.com/certification/verify/',
  },
  {
    id: 'cert-2',
    name: 'Professional Scrum Master I',
    issuer: 'Scrum.org',
    issuedDate: '2022-08-20',
    credentialId: 'PSM-I-789012',
  },
];

const mockSalaryHistory: SalaryHistoryEntry[] = [
  {
    id: 'sal-1',
    effectiveDate: '2023-01-01',
    previousSalary: 80000,
    newSalary: 95000,
    changeType: 'increase',
    reason: 'Annual performance review',
    approvedBy: 'CEO',
  },
  {
    id: 'sal-2',
    effectiveDate: '2024-01-01',
    previousSalary: 95000,
    newSalary: 110000,
    changeType: 'promotion',
    reason: 'Promoted to Senior Engineer',
    approvedBy: 'CEO',
  },
];

const mockBonusHistory: BonusHistoryEntry[] = [
  {
    id: 'bonus-1',
    date: '2023-12-15',
    amount: 150000,
    type: 'annual',
    description: 'Annual performance bonus 2023',
    approvedBy: 'CEO',
  },
  {
    id: 'bonus-2',
    date: '2024-06-30',
    amount: 50000,
    type: 'performance',
    description: 'Q2 project completion bonus',
    approvedBy: 'Engineering Manager',
  },
];

const mockPerformanceReviews: PerformanceReview[] = [
  {
    id: 'pr-1',
    reviewPeriod: 'H1 2024',
    rating: 4.5,
    reviewerId: 'mgr-1',
    reviewerName: 'Engineering Manager',
    strengths: 'Strong technical leadership, excellent code quality, mentors junior developers well',
    improvements: 'Could improve cross-team communication and documentation',
    goals: 'Lead the new microservices architecture project, obtain AWS Professional certification',
    date: '2024-07-01',
  },
  {
    id: 'pr-2',
    reviewPeriod: '2023',
    rating: 4.0,
    reviewerId: 'mgr-1',
    reviewerName: 'Engineering Manager',
    strengths: 'Consistent delivery, strong problem solving, good collaboration',
    improvements: 'Take more ownership of architectural decisions',
    goals: 'Move towards tech lead role, improve system design skills',
    date: '2024-01-15',
  },
];

const mockLeaveRequests: LeaveRequest[] = [
  {
    id: 'lr-1',
    employeeId: 'emp-1',
    type: 'annual',
    startDate: '2024-12-20',
    endDate: '2024-12-27',
    totalDays: 5,
    reason: 'Year-end vacation',
    status: 'approved',
    approvalStatus: 'approved',
    requestedAt: '2024-11-15',
    reviewedAt: '2024-11-16',
    reviewedBy: 'ceo-1',
    reviewNote: 'Approved',
  },
];

const mockProjectAllocations: ProjectAllocation[] = [
  {
    projectId: 'proj-1',
    projectName: 'E-Commerce Platform Redesign',
    role: 'lead',
    allocationPercent: 50,
    startDate: '2024-01-15',
  },
  {
    projectId: 'proj-2',
    projectName: 'Warehouse Management System',
    role: 'senior',
    allocationPercent: 50,
    startDate: '2024-03-01',
  },
];

const mockEmergencyContact: EmergencyContact = {
  name: 'Maria Santos',
  relationship: 'Spouse',
  phone: '081-234-5678',
  email: 'maria.santos@email.com',
};

function generateEmployees(): Employee[] {
  const departments: Department[] = [
    'engineering',
    'design',
    'product',
    'data',
    'devops',
    'qa',
    'management',
    'hr',
    'finance',
    'marketing',
    'sales',
    'operations',
    'robotics',
    'inventory',
    'fulfillment',
    'warehouse_ops',
  ];

  const contractTypes: ContractType[] = ['full_time', 'part_time', 'contract', 'probation'];
  const statuses: EmployeeStatus[] = ['working', 'on_leave', 'sick_leave', 'terminated'];
  const positions = [
    'Software Engineer',
    'Senior Software Engineer',
    'Tech Lead',
    'Engineering Manager',
    'Product Designer',
    'Senior Product Designer',
    'Product Manager',
    'Data Scientist',
    'DevOps Engineer',
    'QA Engineer',
    'HR Specialist',
    'Finance Analyst',
    'Marketing Specialist',
    'Sales Representative',
    'Operations Manager',
    'Robotics Engineer',
    'Inventory Specialist',
    'Fulfillment Coordinator',
    'Warehouse Operator',
  ];

  const firstNames = [
    'James', 'Maria', 'Robert', 'Jennifer', 'Michael', 'Lisa', 'David', 'Sarah',
    'John', 'Emily', 'Christopher', 'Amanda', 'Matthew', 'Ashley', 'Daniel', 'Jessica',
    'Anthony', 'Melissa', 'Mark', 'Deborah', 'Steven', 'Karen', 'Paul', 'Nancy',
    'Andrew', 'Laura', 'Joshua', 'Betty', 'Kenneth', 'Helen', 'Kevin', 'Sandra',
  ];

  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
    'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
    'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
  ];

  const employees: Employee[] = [];

  // Add some specific employees with known data
  employees.push({
    id: 'emp-1',
    code: 'EMP-001',
    firstName: 'James',
    lastName: 'Smith',
    email: 'james.smith@techwarehouse.com',
    phone: '081-234-5678',
    nationalId: '1234567890123',
    address: '123 Sukhumvit Road, Bangkok 10110',
    department: 'engineering',
    position: 'Senior Software Engineer',
    contractType: 'full_time',
    salary: 110000,
    hireDate: '2022-01-15',
    status: 'working',
    managerId: 'emp-5',
    avatar: undefined,
    annualLeaveBalance: 12,
    annualLeaveAccrued: 0.83,
    annualLeaveCarriedOver: 3,
    sickLeaveBalance: 30,
    sickLeaveUsed: 2,
    skills: mockSkills,
    certifications: mockCertifications,
    salaryHistory: mockSalaryHistory,
    bonusHistory: mockBonusHistory,
    performanceReviews: mockPerformanceReviews,
    leaveRequests: mockLeaveRequests,
    emergencyContact: mockEmergencyContact,
    projectAllocations: mockProjectAllocations,
    createdAt: '2022-01-15',
    updatedAt: '2024-01-15',
  });

  employees.push({
    id: 'emp-2',
    code: 'EMP-002',
    firstName: 'Maria',
    lastName: 'Johnson',
    email: 'maria.johnson@techwarehouse.com',
    phone: '082-345-6789',
    nationalId: '2345678901234',
    address: '456 Silom Road, Bangkok 10500',
    department: 'design',
    position: 'Senior Product Designer',
    contractType: 'full_time',
    salary: 95000,
    hireDate: '2022-03-20',
    status: 'working',
    managerId: 'emp-5',
    avatar: undefined,
    annualLeaveBalance: 12,
    annualLeaveAccrued: 0.83,
    annualLeaveCarriedOver: 2,
    sickLeaveBalance: 30,
    sickLeaveUsed: 1,
    skills: [
      { id: 's1', name: 'Figma', category: 'Design', level: 'expert', yearsExperience: 5 },
      { id: 's2', name: 'User Research', category: 'Design', level: 'advanced', yearsExperience: 4 },
      { id: 's3', name: 'Prototyping', category: 'Design', level: 'advanced', yearsExperience: 4 },
      { id: 's4', name: 'Design Systems', category: 'Design', level: 'intermediate', yearsExperience: 2 },
    ],
    certifications: [
      { id: 'c1', name: 'Google UX Design Certificate', issuer: 'Google', issuedDate: '2022-06-15', credentialId: 'GUX-123456' },
    ],
    salaryHistory: [
      { id: 'sh1', effectiveDate: '2023-01-01', previousSalary: 80000, newSalary: 95000, changeType: 'increase', reason: 'Annual review', approvedBy: 'Design Director' },
    ],
    bonusHistory: [
      { id: 'bh1', date: '2023-12-15', amount: 120000, type: 'annual', description: 'Annual bonus 2023', approvedBy: 'CEO' },
    ],
    performanceReviews: [
      { id: 'pr1', reviewPeriod: 'H1 2024', rating: 4.2, reviewerId: 'mgr-2', reviewerName: 'Design Director', strengths: 'Excellent visual design, strong user advocacy', improvements: 'Could improve design system contributions', goals: 'Lead design for new mobile app', date: '2024-07-01' },
    ],
    leaveRequests: [],
    emergencyContact: { name: 'Carlos Johnson', relationship: 'Spouse', phone: '082-345-6789', email: 'carlos.j@email.com' },
    projectAllocations: [
      { projectId: 'proj-1', projectName: 'E-Commerce Platform Redesign', role: 'senior', allocationPercent: 100, startDate: '2024-01-15' },
    ],
    createdAt: '2022-03-20',
    updatedAt: '2024-01-15',
  });

  employees.push({
    id: 'emp-3',
    code: 'EMP-003',
    firstName: 'Robert',
    lastName: 'Williams',
    email: 'robert.williams@techwarehouse.com',
    phone: '083-456-7890',
    nationalId: '3456789012345',
    address: '789 Rama IV Road, Bangkok 10110',
    department: 'product',
    position: 'Product Manager',
    contractType: 'full_time',
    salary: 120000,
    hireDate: '2021-06-10',
    status: 'on_leave',
    managerId: 'emp-5',
    avatar: undefined,
    annualLeaveBalance: 15,
    annualLeaveAccrued: 1.25,
    annualLeaveCarriedOver: 5,
    sickLeaveBalance: 30,
    sickLeaveUsed: 0,
    skills: [
      { id: 's1', name: 'Product Strategy', category: 'Product', level: 'expert', yearsExperience: 6 },
      { id: 's2', name: 'Agile/Scrum', category: 'Process', level: 'advanced', yearsExperience: 5 },
      { id: 's3', name: 'Data Analysis', category: 'Analytics', level: 'intermediate', yearsExperience: 3 },
      { id: 's4', name: 'Stakeholder Management', category: 'Soft Skills', level: 'advanced', yearsExperience: 6 },
    ],
    certifications: [
      { id: 'c1', name: 'Certified Scrum Product Owner', issuer: 'Scrum Alliance', issuedDate: '2021-08-15', expiryDate: '2024-08-15', credentialId: 'CSPO-123456' },
    ],
    salaryHistory: [
      { id: 'sh1', effectiveDate: '2022-01-01', previousSalary: 100000, newSalary: 120000, changeType: 'promotion', reason: 'Promoted to Senior PM', approvedBy: 'CEO' },
    ],
    bonusHistory: [
      { id: 'bh1', date: '2023-12-15', amount: 200000, type: 'annual', description: 'Annual bonus 2023', approvedBy: 'CEO' },
      { id: 'bh2', date: '2024-03-31', amount: 80000, type: 'project_completion', description: 'Product launch bonus', approvedBy: 'CEO' },
    ],
    performanceReviews: [
      { id: 'pr1', reviewPeriod: '2023', rating: 4.7, reviewerId: 'ceo-1', reviewerName: 'CEO', strengths: 'Outstanding product vision, strong delivery track record', improvements: 'Delegate more to team', goals: 'Launch 3 major features in 2024', date: '2024-01-15' },
    ],
    leaveRequests: [
      { id: 'lr1', employeeId: 'emp-3', type: 'maternity', startDate: '2024-11-01', endDate: '2025-02-28', totalDays: 90, reason: 'Maternity leave', status: 'approved', approvalStatus: 'approved', requestedAt: '2024-09-01', reviewedAt: '2024-09-05', reviewedBy: 'ceo-1', reviewNote: 'Approved' },
    ],
    emergencyContact: { name: 'Jennifer Williams', relationship: 'Spouse', phone: '083-456-7890', email: 'jennifer.w@email.com' },
    projectAllocations: [
      { projectId: 'proj-1', projectName: 'E-Commerce Platform Redesign', role: 'lead', allocationPercent: 30, startDate: '2024-01-15' },
      { projectId: 'proj-3', projectName: 'Mobile App Development', role: 'lead', allocationPercent: 70, startDate: '2024-02-01' },
    ],
    createdAt: '2021-06-10',
    updatedAt: '2024-09-01',
  });

  employees.push({
    id: 'emp-4',
    code: 'EMP-004',
    firstName: 'Jennifer',
    lastName: 'Brown',
    email: 'jennifer.brown@techwarehouse.com',
    phone: '084-567-8901',
    nationalId: '4567890123456',
    address: '321 Asoke Road, Bangkok 10110',
    department: 'data',
    position: 'Data Scientist',
    contractType: 'full_time',
    salary: 105000,
    hireDate: '2022-09-01',
    status: 'working',
    managerId: 'emp-5',
    avatar: undefined,
    annualLeaveBalance: 10,
    annualLeaveAccrued: 0.83,
    annualLeaveCarriedOver: 0,
    sickLeaveBalance: 30,
    sickLeaveUsed: 3,
    skills: [
      { id: 's1', name: 'Python', category: 'Programming', level: 'expert', yearsExperience: 5 },
      { id: 's2', name: 'Machine Learning', category: 'Data Science', level: 'advanced', yearsExperience: 4 },
      { id: 's3', name: 'SQL', category: 'Database', level: 'advanced', yearsExperience: 5 },
      { id: 's4', name: 'Tableau', category: 'Visualization', level: 'intermediate', yearsExperience: 2 },
    ],
    certifications: [
      { id: 'c1', name: 'TensorFlow Developer Certificate', issuer: 'Google', issuedDate: '2023-02-15', credentialId: 'TF-123456' },
    ],
    salaryHistory: [
      { id: 'sh1', effectiveDate: '2023-09-01', previousSalary: 90000, newSalary: 105000, changeType: 'increase', reason: 'Annual review', approvedBy: 'Data Director' },
    ],
    bonusHistory: [
      { id: 'bh1', date: '2023-12-15', amount: 100000, type: 'annual', description: 'Annual bonus 2023', approvedBy: 'CEO' },
    ],
    performanceReviews: [
      { id: 'pr1', reviewPeriod: 'H1 2024', rating: 4.3, reviewerId: 'mgr-3', reviewerName: 'Data Director', strengths: 'Strong ML model development, good experimentation practices', improvements: 'Improve production ML ops skills', goals: 'Deploy 2 models to production', date: '2024-07-01' },
    ],
    leaveRequests: [
      { id: 'lr1', employeeId: 'emp-4', type: 'annual', startDate: '2024-07-15', endDate: '2024-07-19', totalDays: 5, reason: 'Summer vacation', status: 'approved', approvalStatus: 'approved', requestedAt: '2024-06-01', reviewedAt: '2024-06-05', reviewedBy: 'ceo-1', reviewNote: 'Approved' },
    ],
    emergencyContact: { name: 'David Brown', relationship: 'Spouse', phone: '084-567-8901', email: 'david.b@email.com' },
    projectAllocations: [
      { projectId: 'proj-2', projectName: 'Warehouse Management System', role: 'senior', allocationPercent: 60, startDate: '2024-03-01' },
      { projectId: 'proj-4', projectName: 'Analytics Dashboard', role: 'lead', allocationPercent: 40, startDate: '2024-04-01' },
    ],
    createdAt: '2022-09-01',
    updatedAt: '2024-01-15',
  });

  employees.push({
    id: 'emp-5',
    code: 'EMP-005',
    firstName: 'Michael',
    lastName: 'Davis',
    email: 'michael.davis@techwarehouse.com',
    phone: '085-678-9012',
    nationalId: '5678901234567',
    address: '555 Thonglor Road, Bangkok 10110',
    department: 'engineering',
    position: 'Engineering Manager',
    contractType: 'full_time',
    salary: 150000,
    hireDate: '2020-01-15',
    status: 'working',
    managerId: undefined,
    avatar: undefined,
    annualLeaveBalance: 15,
    annualLeaveAccrued: 1.25,
    annualLeaveCarriedOver: 5,
    sickLeaveBalance: 30,
    sickLeaveUsed: 1,
    skills: [
      { id: 's1', name: 'Engineering Management', category: 'Management', level: 'expert', yearsExperience: 8 },
      { id: 's2', name: 'System Architecture', category: 'Architecture', level: 'advanced', yearsExperience: 7 },
      { id: 's3', name: 'Team Building', category: 'Management', level: 'expert', yearsExperience: 8 },
      { id: 's4', name: 'Strategic Planning', category: 'Management', level: 'advanced', yearsExperience: 6 },
    ],
    certifications: [
      { id: 'c1', name: 'AWS Certified Solutions Architect - Professional', issuer: 'Amazon Web Services', issuedDate: '2022-03-15', expiryDate: '2025-03-15', credentialId: 'AWS-SAP-123456' },
      { id: 'c2', name: 'Certified Kubernetes Administrator', issuer: 'CNCF', issuedDate: '2021-09-20', expiryDate: '2024-09-20', credentialId: 'CKA-789012' },
    ],
    salaryHistory: [
      { id: 'sh1', effectiveDate: '2021-01-01', previousSalary: 120000, newSalary: 140000, changeType: 'promotion', reason: 'Promoted to Engineering Manager', approvedBy: 'CEO' },
      { id: 'sh2', effectiveDate: '2023-01-01', previousSalary: 140000, newSalary: 150000, changeType: 'increase', reason: 'Annual review', approvedBy: 'CEO' },
    ],
    bonusHistory: [
      { id: 'bh1', date: '2023-12-15', amount: 300000, type: 'annual', description: 'Annual bonus 2023', approvedBy: 'CEO' },
      { id: 'bh2', date: '2024-06-30', amount: 100000, type: 'retention', description: 'Retention bonus', approvedBy: 'CEO' },
    ],
    performanceReviews: [
      { id: 'pr1', reviewPeriod: '2023', rating: 4.8, reviewerId: 'ceo-1', reviewerName: 'CEO', strengths: 'Exceptional leadership, strong technical vision, builds high-performing teams', improvements: 'Balance strategic vs tactical work', goals: 'Scale engineering team to 50', date: '2024-01-15' },
    ],
    leaveRequests: [],
    emergencyContact: { name: 'Sarah Davis', relationship: 'Spouse', phone: '085-678-9012', email: 'sarah.d@email.com' },
    projectAllocations: [
      { projectId: 'proj-1', projectName: 'E-Commerce Platform Redesign', role: 'lead', allocationPercent: 20, startDate: '2024-01-15' },
      { projectId: 'proj-2', projectName: 'Warehouse Management System', role: 'lead', allocationPercent: 20, startDate: '2024-03-01' },
      { projectId: 'proj-3', projectName: 'Mobile App Development', role: 'lead', allocationPercent: 20, startDate: '2024-02-01' },
      { projectId: 'proj-4', projectName: 'Analytics Dashboard', role: 'lead', allocationPercent: 20, startDate: '2024-04-01' },
      { projectId: 'proj-5', projectName: 'API Gateway Modernization', role: 'lead', allocationPercent: 20, startDate: '2024-05-01' },
    ],
    createdAt: '2020-01-15',
    updatedAt: '2024-01-15',
  });

  // Generate remaining 45 employees
  let empCounter = 6;
  for (let i = 0; i < 45; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const department = departments[Math.floor(Math.random() * departments.length)];
    const position = positions[Math.floor(Math.random() * positions.length)];
    const contractType = contractTypes[Math.floor(Math.random() * contractTypes.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const hireYear = 2020 + Math.floor(Math.random() * 5);
    const hireMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const hireDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    const hireDate = `${hireYear}-${hireMonth}-${hireDay}`;

    const yearsOfService = 2024 - hireYear;
    const baseSalary = 40000 + Math.floor(Math.random() * 80000);
    const salary = baseSalary + yearsOfService * 5000;

    employees.push({
      id: `emp-${empCounter}`,
      code: `EMP-${String(empCounter).padStart(3, '0')}`,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@techwarehouse.com`,
      phone: `08${String(Math.floor(Math.random() * 9) + 1)}-${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      nationalId: String(Math.floor(Math.random() * 9000000000000) + 1000000000000),
      address: `${Math.floor(Math.random() * 999) + 1} ${['Sukhumvit', 'Silom', 'Rama IV', 'Asoke', 'Thonglor', 'Phrom Phong', 'Ekkamai'][Math.floor(Math.random() * 7)]} Road, Bangkok ${10110 + Math.floor(Math.random() * 9000)}`,
      department,
      position,
      contractType,
      salary,
      hireDate,
      status,
      managerId: 'emp-5',
      avatar: undefined,
      annualLeaveBalance: yearsOfService >= 5 ? 15 : yearsOfService >= 3 ? 12 : 10,
      annualLeaveAccrued: yearsOfService >= 5 ? 1.25 : yearsOfService >= 3 ? 1.0 : 0.83,
      annualLeaveCarriedOver: Math.floor(Math.random() * 5),
      sickLeaveBalance: 30,
      sickLeaveUsed: Math.floor(Math.random() * 5),
      skills: [],
      certifications: [],
      salaryHistory: [],
      bonusHistory: [],
      performanceReviews: [],
      leaveRequests: [],
      emergencyContact: { name: `Emergency Contact ${empCounter}`, relationship: 'Family', phone: `08${String(Math.floor(Math.random() * 9) + 1)}-${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`, email: `emergency${empCounter}@email.com` },
      projectAllocations: [],
      createdAt: hireDate,
      updatedAt: new Date().toISOString().split('T')[0],
    });
    empCounter++;
  }

  return employees;
}

export const mockEmployees: Employee[] = generateEmployees();