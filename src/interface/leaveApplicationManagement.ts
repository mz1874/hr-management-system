export interface LeaveApplication {
  id: number;
  employeeName: string;
  leaveType: string;
  status: string;         // e.g., "Pending"
  statusCode: string;     // e.g., "P"
  appliedOn: string;
  userRoles: string[];
  selected: boolean;
  department: string;
  reasons: string;
  document: string;
  remainingAnnualLeave: number;
  remainingMedicalLeave: number;
  remarks: string;
  managerComment?: string;  // add this too if you're using it
  dates: {
    id: number;
    date: string;
    duration: string;
    leaveType: string;
    originalLeaveType: string;
    originalDuration: string;
  }[];
}
