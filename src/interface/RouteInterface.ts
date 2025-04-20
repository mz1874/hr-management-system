export interface RouteItem {
    id: number
    name: string
    code: string
    description: string
    component: string
    hidden: boolean
    parent: number | null
    icon: string
    path: string
    order: number
    children?: RouteItem[]
}