export interface Department {
    id: number
    parentId: number | null
    name: string
    sorting: number
    status: 'NORMAL' | 'ON HOLD'
    creationTime: string
    children?: Department[]
}
