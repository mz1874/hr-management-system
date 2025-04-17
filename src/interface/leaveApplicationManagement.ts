export interface LeaveApplication {
    id: number;
    employeeName: string;
    leaveType: string;
    status: string;
    appliedOn: string;
    selected: boolean;
    department: string;
    reasons: string;
    document: string;
    remainingAnnualLeave: number;
    remainingMedicalLeave: number;
    remarks: string;
    dates: {
      id: number;
      date: string;
      duration: string;
      leaveType: string;
      originalLeaveType: string;
      originalDuration: string;
    }[];
  }