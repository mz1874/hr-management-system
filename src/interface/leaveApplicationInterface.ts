// TODO 抽取Task 接口到Interface下
// Define interface for leave details
export interface LeaveDate {
    date: string;
    duration: string;
    leaveType: string;
  }
  
  // TODO 抽取Task 接口到Interface下
 export interface LeaveApplication {
    id: number;
    name: string;
    department: string;
    leaveType: string;
    status: string;
    appliedOn: string;
    dates: LeaveDate[];
    reasons: string;
    document: string;
    reviewComment?: string;
    reviewDate?: string;

  }
  

  