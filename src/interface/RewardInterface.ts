import type {Staff} from "@/interface/UserInterface"
import type { FileUpload } from "@/interface/FileUpload"
import type {Task} from  "@/interface/KpiInterface.ts";

export interface RewardItem {
    id: number
    rewardName: string
    rewardPoints: number
    createdOn: string
    quantity: number
    endDateTime: string
    description: string
    terms: string
    status: string   
    fileId: number             
    fileDetails: FileUpload
}

export interface RewardRedemptionItem {
    id: number
    redeemedOn: string
    pointsDeducted: number
    status: string
    reward: RewardItem
    user: Staff
}

export interface PointEarnedHistory {
    id: number
    user: Staff
    kpi: Task
    pointReceivedOn: string
    pointsEarned: number
}

export interface PointItem {
    id: number
    user: Staff
    details: {
        name: string,
        type: 'KPI' | 'Reward',
        points: number,
        ReceivedOn: string
    }[]
}