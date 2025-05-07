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
    rewardId: number
    rewardTitle: string
    rewardDescription: string
    rewardTerms: string
    rewardEndDateTime: string
    rewardImageId: number
    rewardImageUrl: string
    pointsDeducted: number
    status: string
    user: Staff
}

export interface PointEarnedHistory {
    id: number
    user: Staff
    kpi?: Task  // Optional since it can be null for deductions
    pointsValue: number
    pointsReceivedOn: string  // DateTimeField as string in frontend
    isDeduction: boolean
    reasonType?: 'Lateness' | 'Credit Notice' | 'Leave Without Notice' | 'KPI Completed'  // Optional, matches your Django choices
    description?: string  // Optional
}

// export interface PointItem {
//     id: number
//     user: Staff
//     details: {
//         name: string,
//         type: 'KPI' | 'Reward',
//         points: number,
//         ReceivedOn: string
//     }[]
// }