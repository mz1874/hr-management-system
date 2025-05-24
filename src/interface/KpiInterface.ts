export interface AssignedUser {
    id?: number;
    username: string;
  }
  
  export interface Task {
    id: number;
    taskTitle: string;
    taskDescription: string;
    startDate: string;
    endDate: string;
    pointsGiven: number;
    status: 'Not Yet Started' | 'Ongoing' | 'Completed' | 'Delayed' | 'Terminated';
    totalTarget: number;
    individualUnit: string;
    assignedUsers: AssignedUser[];
    department?: string;
    createdOn?: string;
    seventy_percent: number;
    ninety_percent: number;
    hundred_percent: number;
    hundred_twenty_percent: number;
  }