export interface Staff {
    id: number
    name: string
    dateOfBirth: string
    role: string
    role_names?: string[]
    department: number
    department_name: string
    status: boolean
    imgUrl:string
    employmentDate: string
    resignationDate?: string  // Add new property
    totalPoints: number
    leaveEntitlements?: {
        [key: string]: number
    }
    leaveBalances?: {
        type: string
        code: string
        year: number
        totalDays: number
        usedDays: number
        remainingDays: number
      }[];
      
}