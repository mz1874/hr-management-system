export interface LeaveApplication {
    id: number;
    name: string;
    department: string;
    leaveType: string;
    status: string;
    appliedOn: string;
    selected: boolean;
    dates: {
      date: string;
      duration: string;
      leaveType: string;
    }[];
    reasons: string;
    document: string;
  }