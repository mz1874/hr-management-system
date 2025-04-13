export interface LeaveDate {
    leave_date: string;
    duration: 'F' | 'AM' | 'PM';
    leave_type: number;
  }
  
export interface ApplicationFormData {
    reasons: string;
    selectedDates: LeaveDate[];
    department: number | null;
  }
  
export  interface LeaveType {
    id: number;
    name: string;
    description: string;
  }
  