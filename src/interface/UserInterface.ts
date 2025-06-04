export interface Staff {
    id: number
    username: string,
    staffName:string,
    password: string,
    email : string,
    date_of_birth: string
    roles: number[]
    department: number
    department_name: string
    status: boolean
    imgUrl:string
    employment_time: string
    resignationDate?: string
    totalPoints: number
    currentPoints: number
    picture : number
    leave_entitlements?: {
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