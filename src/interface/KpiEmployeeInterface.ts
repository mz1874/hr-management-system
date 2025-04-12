export interface EmployeeTask {
    username: string;
}

export interface Employee {
    id: number
    username: string
    progress: number
    progressHistory: { date: string; progress: number }[]
    status: string
  }