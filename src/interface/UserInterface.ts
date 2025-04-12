export interface Staff {
    id: number
    name: string
    dateOfBirth: string
    role: string
    department: number
    department_name: string
    status: boolean
    employmentDate: string
    resignationDate?: string  // Add new property
    numberOfLeaves: number
    medicalLeaves: number
    annualLeaves: number
}