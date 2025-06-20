//department interface
export interface Department {
    id: number
    parentId: number | null
    department_name: string
    sorting: number
    creationTime: string
    children?: Department[]
}
