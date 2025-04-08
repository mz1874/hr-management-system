export interface Staff {
    id: number
    name: string
    dateOfBirth: string
    role: string
    department: string
    status: 'Active' | 'Inactive'
    employmentDate: string
    resignationDate?: string  // Add new property
    numberOfLeaves: number
    medicalLeaves: number
    annualLeaves: number
}