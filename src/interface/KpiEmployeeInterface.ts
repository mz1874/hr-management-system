export interface ProgressHistory {
    date: string;
    progress: number;
    status?: string;
    remarks?: string;
    updatedBy?: string;
}
  
export interface Employee {
    id: number;
    username: string;
    progress: number;
    progressHistory: ProgressHistory[];
    status: string;
    staffId?: number;
    targetUnit: number;  // 添加这个字段
  }

export interface EmployeeTask {
    id: number;
    taskName: string;
    taskDescription: string;
    startDate: string;
    endDate: string;
    status: string;
    department: string;
}