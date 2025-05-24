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
    numberOfLeaves: number
    medicalLeaves: number
    annualLeaves: number
    totalPoints: number
    currentPoints: number
    leave_entitlements : []
}