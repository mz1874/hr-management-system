import type {Staff} from "@/interface/UserInterface"

export interface RewardItem {
    id: number
    rewardName: string
    rewardPoints: number
    createdOn: string
    image: string
    quantity: number
    endDateTime: string
    description: string
    terms: string
    status: string
}

export interface RewardRedemptionItem {
    id: number
    redeemedOn: string
    pointsDeducted: number
    status: string
    reward: RewardItem
    user: Staff
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