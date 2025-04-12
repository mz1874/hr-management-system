export interface Task {
    id: number
    username: string
    role: string
    taskName: string
    taskDescription: string
    status: string
    startDate: string
    completionDate: string
    pointsGiven: number
    assignedTo: string
    assignedUsers: string[]
}