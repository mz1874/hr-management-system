export interface Staff {
    id: number
    name: string
    dateOfBirth: string
    role: number[]
    department: number
    department_name: string
    status: boolean
    imgUrl:string
    employmentDate: string
    resignationDate?: string  // Add new property
    numberOfLeaves: number
    medicalLeaves: number
    annualLeaves: number
    totalPoints: number
}