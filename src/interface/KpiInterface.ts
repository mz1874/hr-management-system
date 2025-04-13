export interface Task {
    id: number
    taskName: string
    taskDescription: string
    startDate: string
    completionDate: string
    status: string
    pointsGiven: number
    target: { value: number; unit: string; };
    assignedTo: string,
    assignedUsers?: Task[];
    department: string
}